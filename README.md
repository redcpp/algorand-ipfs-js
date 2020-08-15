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

* Basic working knoweldge of JavaScript (ES6 recommended)
* A working [Node](https://nodejs.org/) installation
* [JS Algorand-SDK V2](https://github.com/algorand/js-algorand-sdk)
* A local client and indexer to connect to **or** a PureStake API key
  * For low-volume use, you can use the PureStake API service for [free](https://www.purestake.com/technology/algorand-api/). 

# Overview

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