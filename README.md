Developers are turning to decentralized storage as a way to avoid censorship, server outages, and hacks. With decentralized systems, connections can dynamically find the most efficient pathway through the Internet and route around congestion or damage.

The Algorand blockchain provides a decentralized, scalable and secure protocol making it an excelent medium to share information, however the current maximum note size for an Algorand transaction is 1KB limiting the amount of transfered data.
Large files cannot be efficiently stored on blockchains. On one hand side, the blockchain becomes bloated with data that has to be propagated within the blockchain network. On the other hand, since the blockchain is replicated on many nodes, a lot of storage space is required without serving an immediate purpose.

IPFS is a file sharing system that can be leveraged to more efficiently store and share large files. It relies on cryptographic hashes that can easily be stored on a blockchain. Nonetheless, IPFS does not permit users to share files with selected parties. This is necessary, if sensitive or personal data needs to be shared.

File-content encryption before uploading to IPFS protects sensitive data from unauthorized access.

Algorand blockchain technology is then utilized for keeping track of the filehashes and filenames, guaranteeing transparency and speed.

Algorand-IPFS integrations allows us to create decentralized applications with secure digital content.

!!! Demo
Check out this site [https://algo-ipfs.surge.sh/](https://algo-ipfs.surge.sh/) that enlists plain/encrypted files for sharing.

[TOC]

# Requirements 

* Basic working knowledge of JavaScript (ES6 recommended)
* A working [Node](https://nodejs.org/) installation
* [JS Algorand-SDK V2](https://github.com/algorand/js-algorand-sdk)
* A local client and indexer to connect to **or** a PureStake API key
  * For low-volume use, you can use the PureStake API service for [free](https://www.purestake.com/technology/algorand-api/). 

# Introduction

The Interplanetary File System (IPFS) is a peer-to-peer decentralized way of storing and referring to files by hashes. A client who wants to retrieve any of those files enjoys access to a nice abstraction layer where it simply needs to call the hash of the file it wants. IPFS then combs through the distributed nodes and supplies the client with the file.

The mechanism is to take a file, hash it cryptographically so you end up with a very small and secure representation of the file which ensures that someone can not just come up with another file that has the same hash and use that as the address.

As long as anyone has the hash of the PDF file, they can retrieve it from IPFS. So sensitive files are not well suited for IPFS in their native states. Unless we do something to these files, sharing sensitive files like health records or images is a poor fit for IPFS.

# Data Flow

![Algorand-IPFS Flow Diagram](assets/algo-ipfs-flow.png?raw=true "Algorand-IPFS Flow Diagram")

+ Step 1: Select the file and encrypt it with the Advanced Encryption Standard.
+ Step 2: Proceed to upload our encrypted file to the IPFS. You'll get a hash that represents the contents of it and that hash will help us retrieve it later, think of it as an URL.
+ Step 3: In the Algorand blockchain send a transaction to any address (that includes the sending address) for an ammount of 0 ALGO and include both the hash and filename in the transaction note. The only requirement is the 0.0001 ALGO fee for the transaction.
+ Step 4 (optional): Retrieve a list of all the transactions carried out by a specific address and select only the ones with both a filename and an IPFS hash specified in the note section. You can now easily share this list of files with others.
+ Step 5: Be it by user selection or any other method use the hash to download the encrypted contents of a file.
+ Step 6: Decrypt the received contents and save them in a new file.

# Usage

To run the application use the command `node App.js` from the parent directory.

Running `node App.js --help` displays the following:

```
usage: App.js [-h] [-v] [-e] [-u UPLOAD] [-d DOWNLOAD]

Algorand-IPFS for secure file sharing
The example provided as part of `App.js` uploads file `assets/algorand_white_paper.pdf` after encyption and proceeds to download it again under the name `_algorand_white_paper.pdf`. This allows you to test the data flow (see above) is working as expected.

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

The example provided as part of `App.js` uploads file `assets/algorand_white_paper.pdf` after encyption and proceeds to download it again under the name `_algorand_white_paper.pdf`. This allows you to test the data flow is working as expected.

# File Structure

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

# Setup

Create file `.env` and fill it in with your configuration:

```
API_KEY=A5x...2zA
ALGO_SERVER=https://testnet-algorand.api.purestake.io/ps2
INDEX_SERVER=https://testnet-algorand.api.purestake.io/idx2
ALGO_PORT=8080

ADDRESS=F3K6...MU2I
SK=128,19,150,...,68,112,254
ENCRYPTION_PASSWORD=mysecureencryptionpassword 
```

The values from the `.env` file are read by `App.py` to set the configuration object that allows us to establish a connection to the Algorand blockchain.

```js
const ALGOD_CONFIG = {
  algodToken: {
    'X-API-Key': process.env.API_KEY || ''
  },
  algodServer: process.env.ALGO_SERVER || '',
  indexerServer: process.env.INDEX_SERVER || '',
  algodPort: process.env.ALGO_PORT || '',
  account: {
    addr: process.env.ADDRESS,
    sk: new Uint8Array(process.env.SK.split(','))
  }
}
```

# Final Thoughts

In general blockchains are not the best solution for storing large volumes of data and files, so we can secure sensitive files by encryption and stored them on the IPFS which is a better network for file sharing than the blockchain.

We can store the IPFS hashes on the blockchain to combine the strengths of both the Algorand blockchain and the distributed file storage. This is a powerful combination because a blockchain is resistant to modification of the data and we can now rest assured that every IPFS hash recorded in the Algorand blockchain points to the exact data we are looking for. Remember, an IPFS hash represents the content not the location, unlike common URLs which point to a location where data is variable through time.

This is just the template of how you could extend Algorand-based applications into the secure file distribution domain and the example code we provided demonstrates how easy it is to integrate both the Algorand SDKs with the IPFS.

> This body of work was inspired by a blog post on Medium called [Learn to securely share files on the blockchain with IPFS!](https://medium.com/@mycoralhealth/learn-to-securely-share-files-on-the-blockchain-with-ipfs-219ee47df54c)
