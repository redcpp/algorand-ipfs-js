const algosdk = require('algosdk')

module.exports = class AlgoWrapper {
  constructor({ algodToken, algodServer, indexerServer, algodPort, account }) {
    if (!this._isValidAccount(account)) {
      console.log(account)
      throw 'Invalid account, expected: {addr:"", sk:""}'
    }
    this.account = account
    this.algodPort = algodPort || ''
    // AlgoNode requires no API key; an empty string is the accepted token.
    this.algodToken = algodToken || ''
    this.algodServer = algodServer
    this.indexerServer = indexerServer

    this.algodClient = new algosdk.Algodv2(this.algodToken, this.algodServer, this.algodPort)
    this.indexerClient = new algosdk.Indexer(this.algodToken, this.indexerServer, this.algodPort)
  }

  _isValidAccount(account) {
    return account && account.addr && account.sk
  }

  async appendFileInfo({ path, cid }) {
    const noteContents = {
      cid: `${cid}`,
      filename: `${path}`
    }
    // algosdk v2: encodeObj returns Uint8Array
    const note = algosdk.encodeObj(noteContents)

    // Check balance
    const accountInfo = await this.algodClient.accountInformation(this.account.addr).do()
    console.log('Account balance: %d microAlgos', accountInfo.amount)

    // Suggested params
    const suggestedParams = await this.algodClient.getTransactionParams().do()

    // 0-Algo self-payment carrying the IPFS note. v2 preferred builder:
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: this.account.addr,
      to: this.account.addr,
      amount: 0,
      note,
      suggestedParams,
    })

    const signedTxn = txn.signTxn(this.account.sk)
    const txId = txn.txID().toString()
    console.log('Signed transaction with txID: %s', txId)

    await this.algodClient.sendRawTransaction(signedTxn).do()

    await this._waitForConfirmation(txId)

    const confirmedTxn = await this.algodClient.pendingTransactionInformation(txId).do()
    console.log('Transaction confirmed in round: %d', confirmedTxn['confirmed-round'])
    if (confirmedTxn.txn && confirmedTxn.txn.txn && confirmedTxn.txn.txn.note) {
      console.log('Decoded note:', algosdk.decodeObj(confirmedTxn.txn.txn.note))
    }
  }

  // algosdk v2 ships waitForConfirmation; keep a thin wrapper for clarity.
  async _waitForConfirmation(txId, maxRounds = 10) {
    return algosdk.waitForConfirmation(this.algodClient, txId, maxRounds)
  }

  async searchFileInfo(filename) {
    console.log('Looking for', filename)

    const accountTxns = await this.indexerClient
      .lookupAccountTransactions(this.account.addr)
      .do()
    const transactions = accountTxns.transactions.sort(
      (a, b) => b['confirmed-round'] - a['confirmed-round']
    )
    console.log('Number of txns for account:', transactions.length)

    for (const txn of transactions) {
      if (txn.note !== undefined) {
        // Indexer returns base64-encoded note string
        const noteBytes = Buffer.from(txn.note, 'base64')
        const note = algosdk.decodeObj(noteBytes)
        if (note.filename === filename) {
          console.log('FOUND!', filename)
          console.log('ID:', txn.id)
          console.log('Note:', note)
          return note
        }
      }
    }
    return null
  }
}
