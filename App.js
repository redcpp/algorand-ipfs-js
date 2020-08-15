require('dotenv').config()
const AlgoIPFS = require('./src/AlgoIPFS');
const main = require('algosdk/src/main');
const ArgumentParser = require('argparse').ArgumentParser;

const ALGOD_CONFIG = {
  algodToken: {
    'X-API-Key': process.env.PS_API_KEY
  },
  algodServer: 'https://testnet-algorand.api.purestake.io/ps2',
  indexerServer: 'https://testnet-algorand.api.purestake.io/idx2',
  algodPort: '',
  account: {
    addr: process.env.ADDRESS,
    sk: new Uint8Array(process.env.SK.split(','))
  }
}

const parseArgs = () => {
  let parser = new ArgumentParser({
    version: '1.0',
    addHelp: true,
    description: 'Algorand-IPFS for secure file sharing'
  })
  parser.addArgument(
    ['-e', '--example'],
    {
      help: 'Run the complete flow -- Upload to Algorand/IPFS the Algorand white paper and download it shortly after',
      nargs: 0
    }
  )
  parser.addArgument(
    ['-u', '--upload'],
    {
      help: 'Encrypt and upload file to IPFS and record hash and filename in Algorand'
    }
  )
  parser.addArgument(
    ['-d', '--download'],
    {
      help: 'Search filehash in Algorand and proceed to download from IPFS then decrypt it'
    }
  )
  parser.addArgument(
    ['-p', '--password'],
    {
      help: 'Change password',
      defaultValue: 'myveryhardtocrackpassword'
    }
  )
  return parser.parseArgs()
}

class App {
  main () {
    let args = parseArgs()
    this.password = args.password

    if (args.example) {
      this.example()
    } else if (args.upload) {
      this.run('upload', args.upload)
    } else if (args.download) {
      this.run('download', args.download)
    }
  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async example () {
    const filepath = './assets/algorand_white_paper.pdf'
    const algo_ipfs = new AlgoIPFS(ALGOD_CONFIG, this.password)

    await algo_ipfs.init()
    await algo_ipfs.pushFile(filepath)

    console.log('Waiting 5 secs for propagation to Indexer')
    await this.sleep(5000)

    await algo_ipfs.pullFile(filepath)
  }

  async run (action, filepath) {
    const algo_ipfs = new AlgoIPFS(ALGOD_CONFIG, this.password)
    await algo_ipfs.init()

    if (action === 'upload') {
      await algo_ipfs.pushFile(filepath)
    } else if (action === 'download') {
      await algo_ipfs.pullFile(filepath)
    } else {
      error_msg = `Invalid action: ${action} ${filename}`
      throw error_msg
    }
  }
}

app = new App()
app.main()

