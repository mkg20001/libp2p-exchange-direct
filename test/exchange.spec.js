'use strict'

const tests = require('interface-data-exchange/src/test')
const {parallel} = require('async')

tests({
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
  before: (eA, eB, eM, cb) => {
    // a & b dial m, then a dials b using m as relay
    parallel([eA, eB].map(e => cb => e.swarm.dial(eM.swarm.peerInfo, cb)), err => {
      if (err) {
        return cb(err)
      }
      setTimeout(() => eA.swarm.dial(eB.swarm.peerInfo, cb), 250) // wait for circuit to find relay
    })
  },
  Exchange: require('../src')
})
