'use strict'

const prom = (fnc) => new Promise((resolve, reject) => fnc((err, res) => err ? reject(err) : resolve(res)))
const wait = (i) => new Promise((resolve, reject) => setTimeout(resolve, i))

module.exports = {
  opt: {
    peerA: {
      addrs: [],
      lp2pOpt: {
        relay: {
          enabled: true
        }
      }
    },
    peerB: {
      addrs: [],
      lp2pOpt: {
        relay: {
          enabled: true
        }
      }
    },
    peerM: {
      addrs: ['/ip4/127.0.0.1/tcp/5394/ws'],
      lp2pOpt: {
        relay: {
          enabled: true,
          hop: {
            enabled: true,
            active: true
          }
        }
      }
    }
  },
  before: async (eA, eB, eM) => {
    // a & b dial m, then a dials b using m as relay
    await Promise.all([eA, eB].map((e) => prom(cb => e.swarm.dial(eM.swarm.peerInfo, cb))))
    await wait(250)
    await prom(cb => eB.swarm.dial(eA.swarm.peerInfo, cb))
  },
  Exchange: require('../src')
}
