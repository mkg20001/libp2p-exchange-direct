'use strict'

const ppb = require('pull-protocol-buffers')
const pull = require('pull-stream')
const {Request, Response} = require('./proto.js')

const debug = require('debug')
const log = debug('libp2p:exchange:direct')
const prom = (fnc) => new Promise((resolve, reject) => fnc((err, res) => err ? reject(err) : resolve(res)))

const ExchangeBase = require('interface-data-exchange')
const PROTOCOL = '/p2p/exchange/direct/1.0.0'

class Exchange extends ExchangeBase {
  constructor (swarm) {
    super(swarm, 'exchange-direct')
  }

  async start () {
    this.swarm.handle(PROTOCOL, (proto, conn) => {
      conn.getPeerInfo((err, pi) => {
        if (err) {
          return log(err)
        }

        const idb58 = pi.id.toB58String()

        log('%s: rpc established', idb58)

        pull(
          conn,
          ppb.decode(Request),
          pull.asyncMap((data, cb) => {
            log('%s: request for %s', idb58, data.ns)

            this._handle(data.ns, pi.id, data.data, (err, res) => {
              if (err) {
                return cb(null, {nack: true})
              }

              return cb(null, res)
            })
          }),
          ppb.encode(Response),
          conn
        )
      })
    })
  }

  async stop (cb) {
    this.swarm.unhandle(PROTOCOL)
  }

  async request (peerId, ns, data) {
    let id = peerId.toB58String()

    log('request on %s to %s', ns, id)

    if (this.swarm.switch.muxedConns[id]) {
      log('request#%s dialing %s', ns, id)
      const conn = await prom(cb => this.swarm.dialProtocol(peerId, PROTOCOL, cb))

      log('request#%s sending request to %s', ns, id)

      return prom(cb => {
        pull(
          pull.values([{ns, data}]),
          ppb.encode(Request),
          conn,
          ppb.decode(Response),
          pull.collect((err, res) => {
            log('request#%s got response from %s', ns, id)

            if (!err && !res.length) {
              err = new Error('Got no result back')
            }

            if (res && res[0] && res[0].nack) {
              err = new Error('Other side refused to accept request')
            }

            if (err) {
              return cb(err)
            }

            return cb(null, res[0].result)
          })
        )
      })
    } else {
      throw new Error('Not connected to peer!')
    }
  }
}

module.exports = Exchange
