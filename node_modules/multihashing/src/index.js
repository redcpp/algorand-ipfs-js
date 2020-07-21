'use strict'

const multihash = require('multihashes')
const blake = require('./blake')
const sha3 = require('./sha3')
const crypto = require('webcrypto')

const mh = module.exports = Multihashing

mh.Buffer = Buffer // for browser things

function Multihashing (buf, func, length) {
  return multihash.encode(mh.digest(buf, func, length), func, length)
}

// expose multihash itself, to avoid silly double requires.
mh.multihash = multihash

mh.digest = function (buf, func, length) {
  let digest = mh.createHash(func).update(buf).digest()

  if (length) {
    digest = digest.slice(0, length)
  }

  return digest
}

mh.createHash = function (func, length) {
  func = multihash.coerceCode(func)
  if (!mh.functions[func]) {
    throw new Error('multihash function ' + func + ' not yet supported')
  }

  return mh.functions[func]()
}

mh.verify = function (hash, buf) {
  const decoded = multihash.decode(hash)
  const encoded = mh(buf, decoded.name, decoded.length)
  return encoded.equals(hash)
}

mh.functions = {
  0x11: gsha1,
  0x12: gsha2256,
  0x13: gsha2512
}

blake.addFuncs(mh.functions)
sha3.addFuncs(mh.functions)

function gsha1 () {
  return crypto.createHash('sha1')
}

function gsha2256 () {
  return crypto.createHash('sha256')
}

function gsha2512 () {
  return crypto.createHash('sha512')
}
