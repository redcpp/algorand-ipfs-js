'use strict'

const blake = require('blakejs')
const minB = 0xb201
const minS = 0xb241

var blake2b = {
  init: blake.blake2bInit,
  update: blake.blake2bUpdate,
  digest: blake.blake2bFinal
}

var blake2s = {
  init: blake.blake2sInit,
  update: blake.blake2sUpdate,
  digest: blake.blake2sFinal
}

class B2Hash {
  constructor (size, hashFunc) {
    this.hf = hashFunc
    this.ctx = this.hf.init(size, null)
  }

  update (buf) {
    if (this.ctx === null) {
      throw new Error('blake2 context is null. (already called digest?)')
    }
    this.hf.update(this.ctx, buf)
    return this
  }

  digest () {
    const ctx = this.ctx
    this.ctx = null
    return Buffer.from(this.hf.digest(ctx))
  }
}

function addFuncs (table) {
  function mkFunc (size, hashFunc) {
    return () => new B2Hash(size, hashFunc)
  }

  var i
  for (i = 0; i < 64; i++) {
    table[minB + i] = mkFunc(i + 1, blake2b)
  }
  for (i = 0; i < 32; i++) {
    table[minS + i] = mkFunc(i + 1, blake2s)
  }
}

module.exports = {
  addFuncs: addFuncs
}
