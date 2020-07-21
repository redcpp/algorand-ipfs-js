const { decodeProperties } = require('./class-utils')

/**
 * A class representation of a property of a Zcash transaction joinsplit proof. Used by {@link ZcashCompressedG2}.
 *
 * This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/Fq2')`.
 *
 * @property {Uint8Array|Buffer} data - a 512-bit block of data
 * @class
 */
class ZcashFq2 {
  /**
   * Instantiate a new `ZcashFq2`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @param {Uint8Array|Buffer} data
   * @constructs ZcashFq2
   */
  constructor (data) {
    this.data = data
  }
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashFq2._nativeName = 'Fq2'
// https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/Proof.hpp#L46
ZcashFq2._propertiesDescriptor = decodeProperties(`
base_blob<512> data;
`)

module.exports = ZcashFq2
