const { decodeProperties } = require('./class-utils')

/**
 * A class representation of a property of a Zcash transaction joinsplit proof. Used by {@link ZcashCompressedG1}.
 *
 * This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/Fq')`.
 *
 * @property {Uint8Array|Buffer} data - a 256-bit block of data
 * @class
 */
class ZcashFq {
  /**
   * Instantiate a new `ZcashFq`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @param {Uint8Array|Buffer} data
   * @constructs ZcashFq
   */
  constructor (data) {
    this.data = data
  }
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashFq._nativeName = 'Fq'
// https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/Proof.hpp#L13
ZcashFq._propertiesDescriptor = decodeProperties(`
base_blob<256> data;
`)

module.exports = ZcashFq
