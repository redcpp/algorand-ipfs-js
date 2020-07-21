'use strict'

const { map } = require('streaming-iterables')
const errcode = require('err-code')

/**
 * BlockService is a hybrid block datastore. It stores data in a local
 * datastore and may retrieve data from a remote Exchange.
 * It uses an internal `datastore.Datastore` instance to store values.
 */
class BlockService {
  /**
   * Create a new BlockService
   *
   * @param {IPFSRepo} ipfsRepo
   */
  constructor (ipfsRepo) {
    this._repo = ipfsRepo
    this._bitswap = null
  }

  /**
   * Add a bitswap instance that communicates with the
   * network to retreive blocks that are not in the local store.
   *
   * If the node is online all requests for blocks first
   * check locally and afterwards ask the network for the blocks.
   *
   * @param {Bitswap} bitswap
   * @returns {void}
   */
  setExchange (bitswap) {
    this._bitswap = bitswap
  }

  /**
   * Go offline, i.e. drop the reference to bitswap.
   *
   * @returns {void}
   */
  unsetExchange () {
    this._bitswap = null
  }

  /**
   * Is the blockservice online, i.e. is bitswap present.
   *
   * @returns {bool}
   */
  hasExchange () {
    return this._bitswap != null
  }

  /**
   * Put a block to the underlying datastore.
   *
   * @param {Block} block
   * @param {Object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   * @returns {Promise}
   */
  put (block, options) {
    if (this.hasExchange()) {
      return this._bitswap.put(block, options)
    } else {
      return this._repo.blocks.put(block, options)
    }
  }

  /**
   * Put a multiple blocks to the underlying datastore.
   *
   * @param {AsyncIterator<Block>} blocks
   * @param {Object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   * @returns {Promise}
   */
  putMany (blocks, options) {
    if (this.hasExchange()) {
      return this._bitswap.putMany(blocks, options)
    } else {
      return this._repo.blocks.putMany(blocks, options)
    }
  }

  /**
   * Get a block by cid.
   *
   * @param {CID} cid
   * @param {Object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   * @returns {Promise<Block>}
   */
  get (cid, options) {
    if (this.hasExchange()) {
      return this._bitswap.get(cid, options)
    } else {
      return this._repo.blocks.get(cid, options)
    }
  }

  /**
   * Get multiple blocks back from an array of cids.
   *
   * @param {AsyncIterator<CID>} cids
   * @param {Object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   * @returns {AsyncIterator<Block>}
   */
  getMany (cids, options) {
    if (!Array.isArray(cids)) {
      throw new Error('first arg must be an array of cids')
    }

    if (this.hasExchange()) {
      return this._bitswap.getMany(cids, options)
    } else {
      const getRepoBlocks = map((cid) => this._repo.blocks.get(cid, options))
      return getRepoBlocks(cids)
    }
  }

  /**
   * Delete a block from the blockstore.
   *
   * @param {CID} cid
   * @param {Object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   * @returns {Promise}
   */
  async delete (cid, options) {
    if (!await this._repo.blocks.has(cid)) {
      throw errcode(new Error('blockstore: block not found'), 'ERR_BLOCK_NOT_FOUND')
    }

    return this._repo.blocks.delete(cid, options)
  }

  /**
   * Delete multiple blocks from the blockstore.
   *
   * @param {AsyncIterator<CID>} cids
   * @param {Object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   * @returns {Promise}
   */
  deleteMany (cids, options) {
    const repo = this._repo

    return this._repo.blocks.deleteMany((async function * () {
      for await (const cid of cids) {
        if (!await repo.blocks.has(cid)) {
          throw errcode(new Error('blockstore: block not found'), 'ERR_BLOCK_NOT_FOUND')
        }

        yield cid
      }
    }()), options)
  }
}

module.exports = BlockService
