const { decodeProperties, toHashHex } = require('./class-utils')

/**
 * A class representation of a Zcash OutPoint for a {@link ZcashTransactionIn}.
 *
 * This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/OutPoint')`.
 *
 * @property {Uint8Array|Buffer} hash
 * @property {number} n
 * @class
 */
class ZcashOutPoint {
  /**
   * Instantiate a new `ZcashOutPoint`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @property {Uint8Array|Buffer} hash
   * @property {number} n
   * @constructs ZcashOutPoint
   */
  constructor (hash, n) {
    this.hash = hash
    this.n = n
  }

  /**
   * Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
   * useful for simplified inspection.
   */
  toJSON () {
    return Object.assign({}, this, {
      hash: toHashHex(this.hash)
    })
  }
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashOutPoint._nativeName = 'COutPoint'
// https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/primitives/transaction.h#L312
ZcashOutPoint._propertiesDescriptor = decodeProperties(`
uint256 hash;
uint32_t n;
`)

module.exports = ZcashOutPoint
