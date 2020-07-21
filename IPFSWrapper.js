const last = require('it-last')
const ipfs = require('ipfs')
const path = require('path')
const fs = require('fs')

module.exports = class IPFSWrapper {
  constructor () {}

  async init () {
    this.node = await ipfs.create()
    const version = await this.node.version()
    console.log('IPFS version:', version.version)
  }

  async uploadFile (filepath) {
    const fileContents = fs.readFileSync(filepath)

    const fileAdded = await last(this.node.add({
      path: path.basename(filepath),
      content: fileContents
    }))

    console.log('Added file:', fileAdded.path, fileAdded.cid)

    return fileAdded
  }

  async downloadFile ({ cid, filename }) {
    console.log('Looking for contents of hash:', cid)

    const chunks = []
    for await (const chunk of this.node.cat(cid)) {
      chunks.push(chunk)
    }
    const fileContents = Buffer.concat(chunks)

    console.log('File contents retrieved with buffer length:', fileContents.length)

    fs.writeFileSync(`_${filename}`, fileContents)

    return fileContents
  }
}
