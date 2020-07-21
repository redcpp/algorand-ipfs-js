const { decodeProperties } = require('./class-utils')

/**
 * A class representation of a property of a Zcash transaction joinsplit proof.
 *
 * This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/CompressedG1')`.
 *
 * @property {boolean} yLsb
 * @property {Fq} x
 * @class
 */
class ZcashCompressedG1 {
  /**
   * Instantiate a new `ZcashCompressedG1`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @param {boolean} yLsb
   * @param {Fq} x
   * @constructs ZcashCompressedG1
   */
  constructor (yLsb, x) {
    this.yLsb = yLsb
    this.x = x
  }
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashCompressedG1._nativeName = 'CompressedG1'
// https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/Proof.hpp#L79
ZcashCompressedG1._propertiesDescriptor = decodeProperties(`
bool y_lsb;
Fq x;
`)

module.exports = ZcashCompressedG1
