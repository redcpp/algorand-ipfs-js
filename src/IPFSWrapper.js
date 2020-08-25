const last = require('it-last')
const ipfs = require('ipfs')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

module.exports = class IPFSWrapper {
  constructor(encryptionPassword = undefined) {
    if (encryptionPassword) {
      this.encryptionPassword = crypto.createHash('sha256').update(String(encryptionPassword)).digest('base64').substr(0, 32)
    }
  }

  async init() {
    this.node = await ipfs.create()
    const version = await this.node.version()
    console.log('IPFS version:', version.version)
  }

  async uploadFile(filepath) {
    let fileContents = fs.readFileSync(filepath)

    if (Boolean(this.encryptionPassword)) {
      console.log('Encrypting file')
      fileContents = this._encryptBuffer(fileContents)
    }

    const fileAdded = await last(this.node.add({
      path: path.basename(filepath),
      content: fileContents
    }))

    console.log('Added file:', fileAdded.path, fileAdded.cid)

    return fileAdded
  }

  async downloadFile({ cid, filename }) {
    console.log('Looking for contents of hash:', cid)

    const chunks = []
    for await (const chunk of this.node.cat(cid)) {
      chunks.push(chunk)
    }
    let fileContents = Buffer.concat(chunks)

    if (Boolean(this.encryptionPassword)) {
      console.log('Unencrypting file')
      fileContents = this._decryptBuffer(fileContents)
    }

    console.log('File contents retrieved with buffer length:', fileContents.length)

    fs.writeFileSync(`_${filename}`, fileContents)

    return fileContents
  }

  _encryptBuffer(buffer) {
    console.log('Running encryption on file before uploading')
    let iv = crypto.randomBytes(IV_LENGTH)
    let cipher = crypto.createCipheriv(ALGORITHM, this.encryptionPassword, iv)
    let encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
    return Buffer.from(iv.toString('hex') + ':' + encrypted.toString('hex'))
  }

  _decryptBuffer(buffer) {
    console.log('Running decryption on downloaded file')
    let textParts = String(buffer).split(':')
    let iv = Buffer.from(textParts.shift(), 'hex')
    let encryptedText = Buffer.from(textParts.join(':'), 'hex')
    let decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionPassword, iv)
    let decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()])
    return decrypted
  }
}
