const { decodeProperties } = require('./class-utils')
const { COIN } = require('./Transaction')

/**
 * A class representation of a Zcash TransactionOut, multiple of which are contained within each {@link ZcashTransaction}.
 *
 * This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/TransactionOut')`.
 *
 * @property {BigInt} value - an amount / value for this TransactionOut
 * @property {Uint8Array|Buffer} scriptPubKey - an arbitrary length byte array
 * @class
 */
class ZcashTransactionOut {
  /**
   * Instantiate a new `ZcashTransactionOut`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @param {BigInt} value
   * @param {Uint8Array|Buffer} scriptPubKey
   * @constructs ZcashTransactionOut
   */
  constructor (value, scriptPubKey) {
    this.value = Number(value)
    this.scriptPubKey = scriptPubKey
  }

  /**
   * Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
   * useful for simplified inspection.
   *
   * The serialized version includes the raw `value` as `valueZat` while `value` is a proper Zcash coin value.
   */
  toJSON () {
    return {
      value: this.value / COIN,
      valueZat: Number(this.value),
      scriptPubKey: this.scriptPubKey.toString('hex')
    }
  }
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashTransactionOut._nativeName = 'CTxOut'
ZcashTransactionOut._propertiesDescriptor = decodeProperties(`
CAmount nValue;
CScript scriptPubKey;
`)

module.exports = ZcashTransactionOut
