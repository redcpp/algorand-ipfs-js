# algo-ipfs demo

Vue 2.7 front-end for the [Algorand-IPFS Integration](https://github.com/redcpp/algorand-ipfs-js) library. Lists every file registered on-chain for a given Algorand address (using zero-Algo note transactions as a public index), and links each entry to its IPFS gateway and explorer page.

**Live:** [algo-ipfs.surge.sh](https://algo-ipfs.surge.sh/)

## How it works

1. On load, queries the AlgoNode **indexer** for all transactions sent by the demo address (hardcoded as a TestNet account in `src/components/Algorand.vue`).
2. Decodes each transaction's note field into `{ filename, cid }`.
3. Renders the list with links to:
   - **IPFS gateway** (`ipfs.io`) — to fetch the file content
   - **Lora explorer** (`lora.algokit.io`) — to inspect the on-chain transaction

The encrypted file in the list (`algorand_white_paper.pdf`) is downloadable but its contents are AES-encrypted — you need the CLI in the parent repo with the matching `ENCRYPTION_PASSWORD` to decrypt.

## Stack

- Vue 2.7 + Vue CLI 5
- `algosdk` v2 (browser indexer client)
- AlgoNode public indexer — no API key needed
- Deployed as static SPA on [Surge](https://surge.sh)

## Run locally

```bash
npm install
npm run serve         # dev server with hot reload on :8080
npm run build         # production bundle to dist/
npm run lint
```

## Deploy

```bash
npm run build
npx surge dist algo-ipfs.surge.sh
```

## Configuration

The AlgoNode endpoint and demo address live in `src/components/Algorand.vue`. To point at MainNet or a different account, edit the constants at the top of that file.

## Why Vue 2

The original 2020 project was Vue 2. The 2026 migration kept Vue 2.7 (the LTS final of the v2 line) rather than rewriting in Vue 3 — same component code works under Vue CLI 5 on modern Node, with much smaller diff. Vue 3 + Vite would be a sensible next refactor if anyone wants it.
