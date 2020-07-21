const { decodeProperties } = require('./class-utils')

/**
 * A class representation of a property of a Zcash transaction joinsplit proof.
 *
 * This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/CompressedG2')`.
 *
 * @property {boolean} yLsb
 * @property {Fq2} x
 * @class
 */
class ZcashCompressedG2 {
  /**
   * Instantiate a new `ZcashCompressedG2`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @param {boolean} yLsb
   * @param {Fq2} x
   * @constructs ZcashCompressedG2
   */
  constructor (yGt, x) {
    this.yGt = yGt
    this.x = x
  }
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashCompressedG2._nativeName = 'CompressedG2'
// https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/Proof.hpp#L129
ZcashCompressedG2._propertiesDescriptor = decodeProperties(`
bool y_gt;
Fq2 x;
`)

module.exports = ZcashCompressedG2
