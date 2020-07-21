'use strict'

const split = require('split2')
const CIDTool = require('../../')

module.exports = {
  command: 'base32 [cids...]',

  describe: 'Convert CIDs to base 32 CID version 1.',

  handler (argv) {
    if (argv.cids && argv.cids.length) {
      return argv.cids.forEach(cid => console.log(CIDTool.base32(cid))) // eslint-disable-line no-console
    }

    process.stdin.pipe(split()).on('data', data => {
      const cid = data.toString().trim()
      if (cid) console.log(CIDTool.base32(cid)) // eslint-disable-line no-console
    })
  }
}
