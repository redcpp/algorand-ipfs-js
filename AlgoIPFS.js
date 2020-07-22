const path = require('path')
const AlgoWrapper = require('./AlgoWrapper')
const IPFSWrapper = require('./IPFSWrapper')

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = class AlgoIPFS {
  constructor(algodConfig, encryptionPassword = undefined) {
    this.algodConfig = algodConfig
    this.encryptionPassword = encryptionPassword
  }

  async init() {
    this.algow = new AlgoWrapper(this.algodConfig)
    this.ipfsw = new IPFSWrapper(this.encryptionPassword)
    await this.ipfsw.init()
  }

  async pushFile(filepath) {
    // UPLOAD file to the IPFS
    const fileAdded = await this.ipfsw.uploadFile(filepath)

    // APPEND information to Algorand
    await this.algow.appendFileInfo(fileAdded)
  }

  async pullFile(filepath) {
    const filename = path.basename(filepath)

    // GET info from Algorand (try 3 times)
    let retries = 3
    let fileInfo = null
    do {
      if (!fileInfo) {
        console.log(`Couldn't find ${filename} information, trying again in 5 sec`)
        await sleep(5000)
      }
      fileInfo = await this.algow.searchFileInfo(filename)
    } while (retries-- > 0 && !fileInfo)

    // RETRIEVE file contents
    await this.ipfsw.downloadFile(fileInfo)
  }
}