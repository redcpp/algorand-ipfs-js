require('dotenv').config()
const AlgoIPFS = require('./AlgoIPFS');
const main = require('algosdk/src/main');
const ArgumentParser = require('argparse').ArgumentParser;

const ALGOD_CONFIG = {
  algodToken: {
    Accept: 'application/json',
    'X-API-Key': process.env.PS_API_KEY
  },
  algodServer: 'https://testnet-algorand.api.purestake.io/ps2',
  indexerServer: 'https://testnet-algorand.api.purestake.io/idx2',
  algodPort: '',
  account: {
    addr: 'F3K6DNWSP7C7U7C4VCMJVX7N723Q6GDGCFHEP2FLIV373FKAYD7LT2MU2I',
    sk: new Uint8Array([
      127, 19, 170, 223, 154, 112, 58, 11, 141, 26, 90,
      98, 33, 35, 96, 229, 69, 57, 235, 173, 31, 28,
      92, 108, 6, 66, 159, 148, 41, 185, 159, 126, 46,
      213, 225, 182, 210, 127, 197, 250, 124, 92, 168, 152,
      154, 223, 237, 254, 183, 15, 24, 102, 17, 78, 71,
      232, 171, 69, 119, 253, 149, 64, 192, 254
    ])
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
      help: 'Run example: Upload encrypted Algorand white paper and download afterwards',
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
    console.log(args)
    this.password = args.password

    if (args.example) {
      this.example()
    } else if (args.upload) {
      this.run('upload', args.upload)
    } else if (args.download) {
      this.run('download', args.download)
    }

    console.log('Done')
  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async example () {
    const filepath = 'algorand_white_paper.pdf'
    const algo_ipfs = new AlgoIPFS(algodConfig, '')

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
