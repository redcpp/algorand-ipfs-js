<template>
  <div></div>
</template>

<script>
import algosdk from "algosdk"
import { Buffer } from "buffer"

// AlgoNode is a free, no-API-key public Algorand endpoint.
// Override at build time with VUE_APP_INDEXER_SERVER if needed.
const indexerServer =
  process.env.VUE_APP_INDEXER_SERVER || "https://testnet-idx.algonode.cloud"
const port = ""
const token = ""

const indexerClient = new algosdk.Indexer(token, indexerServer, port)

const DEMO_ADDRESS =
  process.env.VUE_APP_DEMO_ADDRESS ||
  "7N3NCF342JXBVECI5IEB4LEKKD6FUHY6U2TZZ5BQYARIHXPGLPBJ2FKV3M"

export default {
  created() {
    this.getFiles()
  },
  methods: {
    async getFiles() {
      try {
        const accountTxns = await indexerClient
          .lookupAccountTransactions(DEMO_ADDRESS)
          .do()
        const transactions = (accountTxns.transactions || []).sort(
          (a, b) => b["confirmed-round"] - a["confirmed-round"]
        )
        console.log("Number of txns for account:", transactions.length)

        const foundFiles = {}
        const files = []

        for (const txn of transactions) {
          if (txn.note !== undefined) {
            try {
              const noteBytes = Buffer.from(txn.note, "base64")
              const note = algosdk.decodeObj(noteBytes)
              note.txn = txn.id
              if (note.filename && !foundFiles[note.filename]) {
                files.push(note)
                foundFiles[note.filename] = true
              }
            } catch (decodeErr) {
              // Skip notes that aren't msgpack-encoded by this app.
              console.debug("Skipping unparsable note on tx", txn.id, decodeErr.message)
            }
          }
        }

        this.$emit("files", files)
      } catch (e) {
        console.error("Failed to load files from Algorand indexer:", e)
        this.$emit("files", [])
      }
    },
  },
}
</script>
