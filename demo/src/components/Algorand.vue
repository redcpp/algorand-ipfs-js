<template>
  <div></div>
</template>

<script>
const algosdk = require("algosdk")
const indexerServer = 'https://testnet-algorand.api.purestake.io/idx2'
const port = ""
const token = {
  'X-API-Key': process.env.VUE_APP_API_KEY
}
console.log('key', process.env.VUE_APP_API_KEY)
const indexerClient = new algosdk.Indexer(token, indexerServer, port)

export default {
  created() {
    this.getFiles()
  },
  methods: {
    async getFiles() {
      let accountTxns = await indexerClient
        .lookupAccountTransactions('7N3NCF342JXBVECI5IEB4LEKKD6FUHY6U2TZZ5BQYARIHXPGLPBJ2FKV3M')
        .do()
      let transactions = accountTxns.transactions.sort((a, b) => {
        return b["confirmed-round"] - a["confirmed-round"]
      })
      console.log("Number of txns for account:", transactions.length)

      let foundFiles = {}
      let files = []

      for (let txn of transactions) {
        if (txn.note !== undefined) {
          const noteBase64 = Buffer.from(txn.note, "base64")
          const note = algosdk.decodeObj(noteBase64)
          note.txn = txn.id
          if (!foundFiles[note.filename]) {
            files.push(note)
            foundFiles[note.filename] = true
          }
        }
      }

      this.$emit('files', files)
    },
  },
}
</script>