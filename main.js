const AlgoIPFS = require('./AlgoIPFS')

const algodConfig = {
  algodToken: {
    Accept: 'application/json',
    "X-API-Key": "A4cepxeclB6jMPj2L6CXt2aZapaJqgyQ7wgMp9xA"
  },
  algodServer: "https://testnet-algorand.api.purestake.io/ps2",
  indexerServer: "https://testnet-algorand.api.purestake.io/idx2",
  algodPort: "",
  account: {
    addr: 'F3K6DNWSP7C7U7C4VCMJVX7N723Q6GDGCFHEP2FLIV373FKAYD7LT2MU2I',
    sk: new Uint8Array([
      127,  19, 170, 223, 154, 112,  58,  11, 141,  26,  90,
       98,  33,  35,  96, 229,  69,  57, 235, 173,  31,  28,
       92, 108,   6,  66, 159, 148,  41, 185, 159, 126,  46,
      213, 225, 182, 210, 127, 197, 250, 124,  92, 168, 152,
      154, 223, 237, 254, 183,  15,  24, 102,  17,  78,  71,
      232, 171,  69, 119, 253, 149,  64, 192, 254
    ])
  }
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const main = async () => {
  const filepath = '8.pdf'
  const algo_ipfs = new AlgoIPFS(algodConfig, 'myveryhardtocrackpassword')

  await algo_ipfs.init()
  await algo_ipfs.pushFile(filepath)

  console.log('Waiting 5 secs for propagation to Indexer')
  await sleep(5000)

  await algo_ipfs.pullFile(filepath)
}

main()
