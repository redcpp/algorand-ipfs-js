'use strict'

const varint = require('varint')
const isBuffer = require('is-buffer')

module.exports = (buf) => {
  if (!isBuffer(buf)) {
    throw new Error('arg needs to be a buffer')
  }

  const result = []

  while (buf.length > 0) {
    const num = varint.decode(buf)
    result.push(num)
    buf = buf.slice(varint.decode.bytes)
  }

  return result
}
