# libp2p-exchange-direct

[![](https://img.shields.io/badge/made%20by-mkg20001-blue.svg?style=flat-square)](https://github.com/mkg20001)

> Data Exchange component that uses the swarm to directly dial the taget peer if it is connected

## Use-Case

The use case for this exchange component is to allow quick upgrades of a libp2p-circuit connection using transports that require the data-exchange component.

## Example

```js
'use strict'

const Exchange = require('libp2p-exchange-direct')

const exchangeA = new Exchange(swarmA)
const exchangeB = new Exchange(swarmB)

exchangeA.start(() => {})
exchangeB.start(() => {})

exchangeB.listen('example', (data, cb) => {
  return cb(null, data.reverse())
})

swarmA.dial(swarmB.peerInfo, err => {
  if (err) throw err

  exchangeA.request(swarmB.peerInfo.id, 'example', Buffer.from('Hello World!'), console.log)
})
```
