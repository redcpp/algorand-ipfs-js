'use strict'

const CID = require('cids')

module.exports = function codecs () {
  return Object.keys(CID.codecs).map(name => {
    return { name, code: CID.codecs[name] }
  })
}
