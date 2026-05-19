# Algorand-IPFS

Securely share files using the Algorand blockchain and IPFS. Files are encrypted client-side, uploaded to IPFS, and the resulting hash is anchored in an Algorand transaction note so it can be retrieved (and decrypted) later.

> **2026 update:** This project was modernized to use the **Algorand JavaScript SDK v2**, the current **IPFS HTTP client**, and **[AlgoNode](https://algonode.io)** as the public Algorand API provider (no API key, no signup). The original implementation, which targeted the now-sunset PureStake API (decommissioned December 2022), is preserved in git history if you need to reference it.

**Demo:** [https://algo-ipfs.surge.sh/](https://algo-ipfs.surge.sh/) — a site that enlists plain/encrypted files for sharing.

## Table of Contents

- [Background](#background)
- [Requirements](#requirements)
- [Introduction](#introduction)
- [Data Flow](#data-flow)
- [Usage](#usage)
- [File Structure](#file-structure)
- [Setup](#setup)
- [Security Considerations](#security-considerations)
- [Screenshots](#screenshots)
- [Final Thoughts](#final-thoughts)

## Background

Developers are turning to decentralized storage as a way to avoid censorship, server outages, and hacks. With decentralized systems, connections can dynamically find the most efficient pathway through the Internet and route around congestion or damage.

The Algorand blockchain provides a decentralized, scalable and secure protocol making it an excellent medium to share information, however the current maximum note size for an Algorand transaction is 1KB limiting the amount of transferred data.
Large files cannot be efficiently stored on blockchains. On one hand, the blockchain becomes bloated with data that has to be propagated within the blockchain network. On the other hand, since the blockchain is replicated on many nodes, a lot of storage space is required without serving an immediate purpose.

IPFS is a file sharing system that can be leveraged to more efficiently store and share large files. It relies on cryptographic hashes that can easily be stored on a blockchain. Nonetheless, IPFS does not permit users to share files with selected parties. This is necessary if sensitive or personal data needs to be shared.

File-content encryption before uploading to IPFS protects sensitive data from unauthorized access.

Algorand blockchain technology is then utilized for keeping track of the filehashes and filenames, guaranteeing transparency and speed.

Algorand-IPFS integrations allow us to create decentralized applications with secure digital content.

## Requirements

* Basic working knowledge of JavaScript (ES6 recommended)
* A working [Node](https://nodejs.org/) installation
* [JS Algorand-SDK v2](https://github.com/algorand/js-algorand-sdk)
* Access to an Algorand node and indexer — this project uses [AlgoNode](https://algonode.io)'s free public endpoints by default (no API key required)

## Introduction

The Interplanetary File System (IPFS) is a peer-to-peer decentralized way of storing and referring to files by hashes. A client who wants to retrieve any of those files enjoys access to a nice abstraction layer where it simply needs to call the hash of the file it wants. IPFS then combs through the distributed nodes and supplies the client with the file.

The mechanism is to take a file, hash it cryptographically so you end up with a very small and secure representation of the file which ensures that someone can not just come up with another file that has the same hash and use that as the address.

As long as anyone has the hash of a file, they can retrieve it from IPFS. So sensitive files are not well suited for IPFS in their native states. Unless we do something to these files, sharing sensitive files like health records or images is a poor fit for IPFS.

## Data Flow

![Algorand-IPFS Flow Diagram](assets/algo-ipfs-flow.png?raw=true "Algorand-IPFS Flow Diagram")

+ Step 1: Select the file and encrypt it with the Advanced Encryption Standard.
+ Step 2: Proceed to upload our encrypted file to the IPFS. You'll get a hash that represents the contents of it and that hash will help us retrieve it later, think of it as a URL.
+ Step 3: In the Algorand blockchain send a transaction to any address (that includes the sending address) for an amount of 0 ALGO and include both the hash and filename in the transaction note. The only requirement is the 0.0001 ALGO fee for the transaction.
+ Step 4 (optional): Retrieve a list of all the transactions carried out by a specific address and select only the ones with both a filename and an IPFS hash specified in the note section. You can now easily share this list of files with others.
+ Step 5: Be it by user selection or any other method use the hash to download the encrypted contents of a file.
+ Step 6: Decrypt the received contents and save them in a new file.

## Usage

To run the application use the command `node App.js` from the parent directory.

Running `node App.js --help` displays the following:

```
usage: App.js [-h] [-v] [-e] [-u UPLOAD] [-d DOWNLOAD]

Algorand-IPFS for secure file sharing
The example provided as part of `App.js` uploads file `assets/algorand_white_paper.pdf` after encryption and proceeds to download it again under the name `_algorand_white_paper.pdf`. This allows you to test the data flow (see above) is working as expected.

You can try running the example flow by running `App.js`


Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -e, --example         Run the complete flow -- Upload to Algorand/IPFS the
                        Algorand white paper and download it shortly after
  -u UPLOAD, --upload UPLOAD
                        Encrypt and upload file to IPFS and record hash and
                        filename in Algorand
  -d DOWNLOAD, --download DOWNLOAD
                        Search filehash in Algorand and proceed to download
                        from IPFS then decrypt it
```

**Upload**

```bash
node App.js --upload ./assets/algorand_white_paper.pdf
```

**Download**

```bash
node App.js --download algorand_white_paper.pdf
```

**Example**

```bash
node App.js --example
```

The example provided as part of `App.js` uploads file `assets/algorand_white_paper.pdf` after encryption and proceeds to download it again under the name `_algorand_white_paper.pdf`. This allows you to test the data flow is working as expected.

## File Structure

```
- App.js
- .env
- demo/
- src/
  - AlgoIPFS.js
  - AlgoWrapper.js
  - IPFSWrapper.js
```

All code related to demo is not necessary, it corresponds to step 4 which is optional (see the data flow section above). Site [https://algo-ipfs.surge.sh/](https://algo-ipfs.surge.sh/) was constructed by using that code. You can checkout tutorial [Real-time block visualizer with Vue](https://developer.algorand.org/tutorials/real-time-block-visualizer-vue/) to better understand how Vue.js interaction with Algorand works.

File `App.js` helps us interact with the user via the command line. It's also the place where we set the configuration for connecting to Algorand.

Directory `src/` contains 3 scripts, each one is a class on its own.

Script `AlgoIPFS.js` defines only 2 methods, `pushFile()` and `pullFile()`. That way after setting up all of our configuration on initialization we only care about the filepath/filename without getting into details.

`AlgoWrapper.js` handles all communication to the Algorand blockchain while `IPFSWrapper.js` communicates to the IPFS.

## Setup

This project connects to Algorand through [AlgoNode](https://algonode.io), a free public infrastructure for Algorand — **no API key, no signup**. Use whichever network you prefer:

| Network  | Algod endpoint                              | Indexer endpoint                                |
| -------- | ------------------------------------------- | ----------------------------------------------- |
| MainNet  | `https://mainnet-api.algonode.cloud`        | `https://mainnet-idx.algonode.cloud`            |
| TestNet  | `https://testnet-api.algonode.cloud`        | `https://testnet-idx.algonode.cloud`            |

Create a file named `.env` in the project root and fill it in with your configuration:

```
ALGO_SERVER=https://testnet-api.algonode.cloud
INDEX_SERVER=https://testnet-idx.algonode.cloud
ALGO_PORT=443

ADDRESS=F3K6...MU2I
SK=128,19,150,...,68,112,254
ENCRYPTION_PASSWORD=a-unique-password-per-file
```

The values from the `.env` file are read by `App.js` to set the configuration object that allows us to establish a connection to the Algorand blockchain.

```js
const ALGOD_CONFIG = {
  algodToken: '',
  algodServer: process.env.ALGO_SERVER || '',
  indexerServer: process.env.INDEX_SERVER || '',
  algodPort: process.env.ALGO_PORT || '',
  account: {
    addr: process.env.ADDRESS,
    sk: new Uint8Array(process.env.SK.split(','))
  }
}
```

AlgoNode does not require a token, so `algodToken` is an empty string. If you instead run a local `algod`/`indexer`, point `ALGO_SERVER`/`INDEX_SERVER` at your local instance and supply the appropriate token.

## Security Considerations

Please read this section carefully before storing anything sensitive.

- **Use a unique `ENCRYPTION_PASSWORD` per file.** Reusing the same password (and therefore the same derived key) across multiple files significantly weakens AES-based encryption — particularly for modes that depend on a fresh key/nonce pair for confidentiality and integrity guarantees. Treat each file's password as a one-time secret and store it out-of-band (e.g. in a password manager) when sharing.
- **Algorand transaction notes are public and permanent.** The encrypted IPFS hash and filename you record in the transaction `note` field are visible on-chain to anyone scanning the network, forever. There is no way to delete or redact them. Anyone who later obtains the password can decrypt the corresponding file.
- **IPFS content is publicly addressable.** Once a file is pinned to IPFS, anyone with its hash can fetch the ciphertext. The confidentiality of your file rests entirely on the encryption layer, not on the storage layer. If your encryption is weak or the password leaks, the file is compromised.
- **Do not commit `.env`** or any file containing your account secret key (`SK`) or encryption passwords. Add `.env` to `.gitignore`.
- **Filenames are visible too.** The filename is stored alongside the hash in the transaction note. Avoid encoding sensitive information in filenames.

## Screenshots

<!-- TODO: add UI screenshot showing the file upload + transaction list flow -->
<!-- Save the image to assets/demo-screenshot.png and the reference below will resolve. -->
![Demo UI](assets/demo-screenshot.png)

## Final Thoughts

In general blockchains are not the best solution for storing large volumes of data and files, so we can secure sensitive files by encryption and store them on the IPFS which is a better network for file sharing than the blockchain.

We can store the IPFS hashes on the blockchain to combine the strengths of both the Algorand blockchain and the distributed file storage. This is a powerful combination because a blockchain is resistant to modification of the data and we can now rest assured that every IPFS hash recorded in the Algorand blockchain points to the exact data we are looking for. Remember, an IPFS hash represents the content not the location, unlike common URLs which point to a location where data is variable through time.

This is just the template of how you could extend Algorand-based applications into the secure file distribution domain and the example code we provided demonstrates how easy it is to integrate both the Algorand SDKs with the IPFS.

> This body of work was inspired by a blog post on Medium called [Learn to securely share files on the blockchain with IPFS!](https://medium.com/@mycoralhealth/learn-to-securely-share-files-on-the-blockchain-with-ipfs-219ee47df54c)
