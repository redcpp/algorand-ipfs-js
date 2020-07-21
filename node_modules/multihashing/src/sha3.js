'use strict'

const sha3 = require('js-sha3')

const functions = [
  [0x14, sha3.sha3_512],
  [0x15, sha3.sha3_384],
  [0x16, sha3.sha3_256],
  [0x17, sha3.sha3_224],
  [0x18, sha3.shake128, 256],
  [0x19, sha3.shake256, 512],
  [0x1A, sha3.keccak224],
  [0x1B, sha3.keccak256],
  [0x1C, sha3.keccak384],
  [0x1D, sha3.keccak512]
]

class Hasher {
  constructor (hashFunc, arg) {
    this.hf = hashFunc
    this.arg = arg
    this.input = null
  }

  update (buf) {
    this.input = buf
    return this
  }

  digest () {
    const input = this.input
    const arg = this.arg
    return Buffer.from(this.hf(input, arg), 'hex')
  }
}

function addFuncs (table) {
  for (const info of functions) {
    const code = info[0]
    const fn = info[1]

    if (info.length === 3) {
      table[code] = () => new Hasher(fn, info[2])
    } else {
      table[code] = () => new Hasher(fn)
    }
  }
}

module.exports = {
  addFuncs: addFuncs
}
