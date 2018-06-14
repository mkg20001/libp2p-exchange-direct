'use strict'

const protons = require('protons')

module.exports = protons(`

message Request {
  required string ns = 1;
  required bytes data = 2;
}

message Response {
  bool nack = 1;
  bytes result = 2;
}

`)
