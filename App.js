require('dotenv').config()
const AlgoIPFS = require('./src/AlgoIPFS')
const ArgumentParser = require('argparse').ArgumentParser

// AlgoNode (https://algonode.io/api/) is a free, no-API-key public Algorand
// endpoint. Override via .env if you want MainNet or a private node.
const DEFAULT_ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const DEFAULT_INDEXER_SERVER = 'https://testnet-idx.algonode.cloud'

const ALGOD_CONFIG = {
  // AlgoNode requires no token; pass an empty string.
  algodToken: '',
  algodServer: process.env.ALGO_SERVER || DEFAULT_ALGOD_SERVER,
  indexerServer: process.env.INDEX_SERVER || DEFAULT_INDEXER_SERVER,
  algodPort: process.env.ALGO_PORT || '',
  account: {
    addr: process.env.ADDRESS,
    sk: process.env.SK ? new Uint8Array(process.env.SK.split(',').map(Number)) : undefined,
  },
}

const parseArgs = () => {
  const parser = new ArgumentParser({
    prog: 'algo-ipfs',
    add_help: true,
    description: 'Algorand-IPFS for secure file sharing',
  })
  parser.add_argument('-e', '--example', {
    action: 'store_true',
    help: 'Test the complete flow -- Upload to Algorand/IPFS the Algorand white paper and download it shortly after',
  })
  parser.add_argument('-u', '--upload', {
    help: 'Encrypt and upload file to IPFS and record hash and filename in Algorand',
  })
  parser.add_argument('-d', '--download', {
    help: 'Search filehash in Algorand and proceed to download from IPFS then decrypt it',
  })
  return parser
}

class App {
  async main() {
    const parser = parseArgs()
    const args = parser.parse_args()

    if (args.example) {
      await this.example()
    } else if (args.upload) {
      await this.run('upload', args.upload)
    } else if (args.download) {
      await this.run('download', args.download)
    } else {
      parser.print_help()
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async example() {
    const filepath = './assets/algorand_white_paper.pdf'
    const algo_ipfs = new AlgoIPFS({
      ...ALGOD_CONFIG,
      encryptionPassword: process.env.ENCRYPTION_PASSWORD,
    })

    await algo_ipfs.init()
    await algo_ipfs.pushFile(filepath)

    console.log('Waiting 5 secs for propagation to Indexer')
    await this.sleep(5000)

    await algo_ipfs.pullFile(filepath)
  }

  async run(action, filepath) {
    const algo_ipfs = new AlgoIPFS({
      ...ALGOD_CONFIG,
      encryptionPassword: process.env.ENCRYPTION_PASSWORD,
    })
    await algo_ipfs.init()

    if (action === 'upload') {
      await algo_ipfs.pushFile(filepath)
    } else if (action === 'download') {
      await algo_ipfs.pullFile(filepath)
    } else {
      throw new Error(`Invalid action: ${action} ${filepath}`)
    }
  }
}

async function globalMain() {
  const app = new App()
  await app.main()
  process.exit()
}

globalMain()
