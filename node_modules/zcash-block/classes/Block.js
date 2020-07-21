const multihashing = require('multihashing')
const { decodeProperties, toHashHex } = require('./class-utils')

const GENESIS_BITS = 0x1f07ffff

/**
 * A class representation of a Zcash Block, parent for all of the data included in the raw block data
 * in addition to some information that can be calculated based on that data. Properties are intended to
 * match the names that are provided by the Zcash API (hence the casing and some strange names).
 *
 * Exported as the main object, available as `require('zcash-block')`.
 *
 * @property {number} version - positive integer
 * @property {Uint8Array|Buffer} previousblockhash - 256-bit hash
 * @property {Uint8Array|Buffer} merkleroot - 256-bit hash
 * @property {Uint8Array|Buffer} finalsaplingroot - 256-bit hash
 * @property {number} time - seconds since epoch
 * @property {number} bits
 * @property {Uint8Array|Buffer} nonce - 256-bit hash
 * @property {Uint8Array|Buffer} solution
 * @property {Uint8Array|Buffer} hash - 256-bit hash, a double SHA2-256 hash of all bytes making up this block (calculated)
 * @property {Array.<ZcashTransaction>} transactions
 * @property {number} difficulty - the difficulty for this block (calculated)
 * @class
 */

class ZcashBlock {
  /**
   * Instantiate a new `ZcashBlock`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @param {number} version
   * @param {Uint8Array|Buffer} previousblockhash
   * @param {Uint8Array|Buffer} merkleroot
   * @param {Uint8Array|Buffer} finalsaplingroot
   * @param {number} time
   * @param {number} bits
   * @param {Uint8Array|Buffer} nonce
   * @param {Uint8Array|Buffer} solution
   * @param {Uint8Array|Buffer} hash
   * @param {Array.<ZcashTransaction>} transactions
   * @constructs ZcashBlock
   */
  constructor (version, previousblockhash, merkleroot, finalsaplingroot, time, bits, nonce, solution, hash, transactions, size) {
    this.version = version
    this.previousblockhash = previousblockhash
    this.merkleroot = merkleroot
    this.finalsaplingroot = finalsaplingroot
    this.time = time
    this.bits = bits
    this.nonce = nonce
    this.solution = solution
    this.hash = hash
    this.transactions = transactions
    this.size = size

    let difficulty = null
    Object.defineProperty(this, 'difficulty', {
      enumerable: true,
      get: function () {
        if (difficulty === null) {
          const genesisTargetDifficulty = targetDifficulty(GENESIS_BITS)
          const currentTargetDifficulty = targetDifficulty(this.bits)
          difficulty = genesisTargetDifficulty / currentTargetDifficulty
        }
        return difficulty
      }
    })
  }

  toJSON () {
    const obj = {
      hash: toHashHex(this.hash),
      version: this.version,
      merkleroot: toHashHex(this.merkleroot),
      finalsaplingroot: toHashHex(this.finalsaplingroot),
      time: this.time,
      nonce: toHashHex(this.nonce),
      solution: this.solution.toString('hex'),
      bits: Number(this.bits).toString(16),
      difficulty: this.difficulty
    }

    if (this.transactions) {
      obj.tx = this.transactions.map((tx) => { return toHashHex(tx.hash) })
    }
    if (this.size != null) {
      obj.size = this.size
    }

    const previousblockhash = toHashHex(this.previousblockhash)
    if (!/^0+$/.test(previousblockhash)) { // not genesis block?
      obj.previousblockhash = previousblockhash
    }

    return obj
  }

  /**
   * Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
   * useful for simplified inspection.
   */
  toSerializable () {
    return this.toJSON()
  }
}

function targetDifficulty (bits) {
  var target = bits & 0xffffff
  var mov = 8 * ((bits >>> 24) - 3)
  while (mov-- > 0) {
    target *= 2
  }
  return target
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashBlock._nativeName = 'CBlockHeader'
// https://github.com/zcash/zcash/blob/fa1b656482a38d3a6c97950b35521a9c45da1e9c/src/primitives/block.h#L26
ZcashBlock._propertiesDescriptor = decodeProperties(`
_customDecoderMarkStart
int32_t nVersion;
uint256 hashPrevBlock;
uint256 hashMerkleRoot;
uint256 hashFinalSaplingRoot;
uint32_t nTime;
uint32_t nBits;
uint256 nNonce;
std::vector<unsigned char> nSolution;
_customDecodeHash
std::vector<CTransaction> transactions;
_customDecodeSize
`)

ZcashBlock._customDecoderMarkStart = function (decoder, properties, state) {
  state.blockStartPos = decoder.currentPosition()
}

ZcashBlock._customDecodeHash = function (decoder, properties, state) {
  const start = state.blockStartPos
  const end = decoder.currentPosition()
  const hashBytes = decoder.absoluteSlice(start, end - start)
  // double hash
  let digest = multihashing.digest(hashBytes, 'sha2-256')
  digest = multihashing.digest(digest, 'sha2-256')
  properties.push(digest)
}

ZcashBlock._customDecodeSize = function (decoder, properties, state) {
  const start = state.blockStartPos
  const end = decoder.currentPosition()
  const size = end - start
  properties.push(size)
}

class ZcashBlockHeaderOnly extends ZcashBlock {}
ZcashBlockHeaderOnly._nativeName = 'CBlockHeader__Only'
// properties is the same, minus the last two for transactions & size
ZcashBlockHeaderOnly._propertiesDescriptor = decodeProperties(`
_customDecoderMarkStart
int32_t nVersion;
uint256 hashPrevBlock;
uint256 hashMerkleRoot;
uint256 hashFinalSaplingRoot;
uint32_t nTime;
uint32_t nBits;
uint256 nNonce;
std::vector<unsigned char> nSolution;
_customDecodeHash
`)
ZcashBlockHeaderOnly._customDecoderMarkStart = ZcashBlock._customDecoderMarkStart
ZcashBlockHeaderOnly._customDecodeHash = ZcashBlock._customDecodeHash

module.exports = ZcashBlock
module.exports.ZcashBlockHeaderOnly = ZcashBlockHeaderOnly
