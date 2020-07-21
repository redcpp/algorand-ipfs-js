const last = require('it-last')
const ipfs = require('ipfs')
const path = require('path')
const fs = require('fs')
var crypto = require('crypto'), algorithm = 'aes-256-ctr';

module.exports = class IPFSWrapper {
  constructor (encryptionPassword=undefined) {
    this.encryptionPassword = encryptionPassword
  }

  async init () {
    this.node = await ipfs.create()
    const version = await this.node.version()
    console.log('IPFS version:', version.version)
  }

  async uploadFile (filepath) {
    let fileContents = fs.readFileSync(filepath)

    if (Boolean(this.encryptionPassword)) {
      fileContents = this._encryptBuffer(fileContents)
    }

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
    let fileContents = Buffer.concat(chunks)

    if (Boolean(this.encryptionPassword)) {
      fileContents = this._decryptBuffer(fileContents)
    }

    console.log('File contents retrieved with buffer length:', fileContents.length)

    fs.writeFileSync(`_${filename}`, fileContents)

    return fileContents
  }

  _encryptBuffer (buffer){
    console.log('Running encryption on file before uploading')
    let cipher = crypto.createCipher(algorithm, this.encryptionPassword)
    let crypted = Buffer.concat([cipher.update(buffer), cipher.final()])
    return crypted
  }
  
  _decryptBuffer (buffer) {
    console.log('Running decryption on downloaded file')
    let decipher = crypto.createDecipher(algorithm, this.encryptionPassword)
    let dec = Buffer.concat([decipher.update(buffer), decipher.final()])
    return dec
  }
}
