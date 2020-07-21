const multihashing = require('multihashing')
const { decodeProperties, toHashHex, COIN } = require('./class-utils')

const OVERWINTER_TX_VERSION = 3
const SAPLING_TX_VERSION = 4
const OVERWINTER_VERSION_GROUP_ID = 0x03C48270
const SAPLING_VERSION_GROUP_ID = 0x892F2085

/**
 * A class representation of a Zcash Transaction, multiple of which are contained within each {@link ZcashBlock}.
 *
 * This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/Transaction')`.
 *
 * @property {boolean} overwintered
 * @property {number} version
 * @property {number} versionGroupId
 * @property {Array.<ZcashTransactionIn>} vin
 * @property {Array.<ZcashTransactionIn>} vout
 * @property {number} lockTime
 * @property {number|null} expiryHeight - only present in certain block formats
 * @property {BigInt|null} valueBalance - only present in certain block formats
 * @property {Array.<ZcashSpendDescription>|null} shieldedSpend - only present in certain block formats
 * @property {Array.<ZcashOutputDescription>|null} shieldedOutput - only present in certain block formats
 * @property {Uint8Array|Buffer|null} joinSplitPubKey - a 256-bit hash - only present in certain block formats
 * @property {Array.<ZcashJoinSplitDescription>|null} joinSplits - only present in certain block formats
 * @property {Uint8Array|Buffer|null} joinSplitSig - a 512-bit signature - only present in certain block formats
 * @property {Uint8Array|Buffer|null} bindingSig - a 512-bit signature - only present in certain block formats
 * @property {Uint8Array|Buffer} hash - 256-bit hash, a double SHA2-256 hash of all bytes making up this block (calculated)
 * @class
 */
class ZcashTransaction {
  /**
   * Instantiate a new `ZcashTransaction`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @property {boolean} overwintered
   * @property {number} version
   * @property {number} versionGroupId
   * @property {Array.<ZcashTransactionIn>} vin
   * @property {Array.<ZcashTransactionIn>} vout
   * @property {number} lockTime
   * @property {number|null} expiryHeight
   * @property {BigInt|null} valueBalance
   * @property {Array.<ZcashSpendDescription>|null} shieldedSpend
   * @property {Array.<ZcashOutputDescription>|null} shieldedOutput
   * @property {Uint8Array|Buffer|null} joinSplitPubKey
   * @property {Array.<ZcashJoinSplitDescription>|null} joinSplits
   * @property {Uint8Array|Buffer|null} joinSplitSig
   * @property {Uint8Array|Buffer|null} bindingSig
   * @property {Uint8Array|Buffer} hash
   * @constructs ZcashTransaction
   */
  constructor (overwintered, version, versionGroupId, vin, vout, lockTime, expiryHeight, valueBalance, shieldedSpend, shieldedOutput, joinSplits, joinSplitPubKey, joinSplitSig, bindingSig, hash) {
    this.overwintered = overwintered
    this.version = version
    this.versionGroupId = versionGroupId
    this.vin = vin
    this.vout = vout
    this.lockTime = lockTime
    this.expiryHeight = expiryHeight
    this.valueBalance = valueBalance
    this.shieldedSpend = shieldedSpend
    this.shieldedOutput = shieldedOutput
    this.joinSplitPubKey = joinSplitPubKey
    this.joinSplits = joinSplits
    this.joinSplitSig = joinSplitSig
    this.bindingSig = bindingSig
    this.hash = hash
  }

  /**
   * Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
   * useful for simplified inspection.
   */
  toJSON () {
    return Object.assign({}, this, {
      versionGroupId: this.versionGroupId.toString(16),
      valueBalance: Number(this.valueBalance) / COIN,
      hash: toHashHex(this.hash)
    })
  }

  /**
  * Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
  * useful for simplified inspection.
  */
  toSerializable () {
    return this.toJSON()
  }
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashTransaction._nativeName = 'CTransaction'
ZcashTransaction._propertiesDescriptor = decodeProperties(`
_customDecodeVersionAndGroup
const std::vector<CTxIn> vin;
const std::vector<CTxOut> vout;
const uint32_t nLockTime;
_customDecodeExpiryHeight
_customDecodeBalanceAndShielded
_customDecodeJoinSplit
_customDecodeBindingSig
_customDecodeHash
`)

// https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/primitives/transaction.h#L576-L600
ZcashTransaction._customDecodeVersionAndGroup = function (decoder, properties, state) {
  state.transactionStartPos = decoder.currentPosition()
  const txheader = decoder.readUInt32LE()
  state.fOverwintered = Boolean(txheader >> 31)
  properties.push(state.fOverwintered)
  state.nVersion = txheader & 0x7FFFFFFF
  properties.push(state.nVersion)
  state.nVersionGroupId = 0
  if (state.fOverwintered) {
    state.nVersionGroupId = decoder.readUInt32LE()
  }
  properties.push(state.nVersionGroupId)
  if (state.fOverwintered && !(isOverwinterV3(state) || isSaplingV4(state))) {
    throw new Error('Unknown transaction format')
  }
}

function isOverwinterV3 (state) {
  return state.fOverwintered &&
    state.nVersionGroupId === OVERWINTER_VERSION_GROUP_ID &&
    state.nVersion === OVERWINTER_TX_VERSION
}

function isSaplingV4 (state) {
  return state.fOverwintered &&
    state.nVersionGroupId === SAPLING_VERSION_GROUP_ID &&
    state.nVersion === SAPLING_TX_VERSION
}

ZcashTransaction._customDecodeExpiryHeight = function (decoder, properties, state) {
  let expiryHeight = 0
  if (isOverwinterV3(state) || isSaplingV4(state)) {
    expiryHeight = decoder.readUInt32LE()
  }
  properties.push(expiryHeight)
}

ZcashTransaction._customDecodeBalanceAndShielded = function (decoder, properties, state) {
  let valueBalance = null
  let shieldedSpend = null
  let shieldedOutput = null
  if (isSaplingV4(state)) {
    valueBalance = decoder.readBigInt64LE() // CAmount
    shieldedSpend = decoder.readType('std::vector<SpendDescription>')
    shieldedOutput = decoder.readType('std::vector<OutputDescription>')
  }
  properties.push(valueBalance)
  properties.push(shieldedSpend)
  properties.push(shieldedOutput)
}

ZcashTransaction._customDecodeJoinSplit = function (decoder, properties, state) {
  let joinSplits = []
  let joinSplitPubKey
  let joinSplitSig
  if (state.nVersion >= 2) {
    joinSplits = decoder.readType('std::vector<JSDescription>')
    if (joinSplits.length > 0) {
      joinSplitPubKey = decoder.readType('uint256')
      joinSplitSig = decoder.readType('joinsplit_sig_t')
    }
  }
  properties.push(joinSplits)
  properties.push(joinSplitPubKey)
  properties.push(joinSplitSig)
}

ZcashTransaction._customDecodeBindingSig = function (decoder, properties, state) {
  const shieldedSpend = properties[8]
  const shieldedOutput = properties[9]
  let bindingSig
  if (isSaplingV4(state) && !(shieldedSpend.length === 0 && shieldedOutput.length === 0)) {
    bindingSig = decoder.readType('binding_sig_t')
  }
  properties.push(bindingSig)
}

ZcashTransaction._customDecodeHash = function (decoder, properties, state) {
  const start = state.transactionStartPos
  const end = decoder.currentPosition()
  const hashBytes = decoder.absoluteSlice(start, end - start)
  // double hash
  let digest = multihashing.digest(hashBytes, 'sha2-256')
  digest = multihashing.digest(digest, 'sha2-256')
  properties.push(digest)
}

module.exports = ZcashTransaction
module.exports.COIN = COIN
