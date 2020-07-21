const { decodeProperties, toHashHex } = require('./class-utils')

/**
 * A class representation of a Zcash spend description.
 *
 * This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/SpendDescription')`.
 *
 * @property {Uint8Array|Buffer} cv - a 256-bit value commitment to the value of the input note
 * @property {Uint8Array|Buffer} anchor - a 256-bit Merkle root of the Sapling note commitment tree at some block height in the past
 * @property {Uint8Array|Buffer} nullifier - a 256-bit nullifier of the input note
 * @property {Uint8Array|Buffer} rk - a 256-bit randomized public key for spendAuthSig
 * @property {Uint8Array|Buffer} zkproof - a GrothProof encoded directly as 192 bytes of binary data
 * @property {Uint8Array|Buffer} spendAuthSig - a 512-bit signature authorizing this spend
 * @class
 */
class ZcashSpendDescription {
  /**
   * Instantiate a new `ZcashSpendDescription`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @param {Uint8Array|Buffer} cv
   * @param {Uint8Array|Buffer} anchor
   * @param {Uint8Array|Buffer} nullifier
   * @param {Uint8Array|Buffer} rk
   * @param {Uint8Array|Buffer} zkproof
   * @param {Uint8Array|Buffer} spendAuthSig
   * @constructs ZcashSpendDescription
   */
  constructor (cv, anchor, nullifier, rk, zkproof, spendAuthSig) {
    this.cv = cv
    this.anchor = anchor
    this.nullifier = nullifier
    this.rk = rk
    this.zkproof = zkproof
    this.spendAuthSig = spendAuthSig
  }

  /**
   * Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
   * useful for simplified inspection.
   */
  toJSON () {
    return {
      cv: toHashHex(this.cv),
      anchor: toHashHex(this.anchor),
      nullifier: toHashHex(this.nullifier),
      rk: toHashHex(this.rk),
      zkproof: this.zkproof.toString('hex'),
      spendAuthSig: this.spendAuthSig.toString('hex')
    }
  }
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashSpendDescription._nativeName = 'SpendDescription'
// https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/primitives/transaction.h#L48
ZcashSpendDescription._propertiesDescriptor = decodeProperties(`
uint256 cv;                    //!< A value commitment to the value of the input note.
uint256 anchor;                //!< A Merkle root of the Sapling note commitment tree at some block height in the past.
uint256 nullifier;             //!< The nullifier of the input note.
uint256 rk;                    //!< The randomized public key for spendAuthSig.
libzcash::GrothProof zkproof;  //!< A zero-knowledge proof using the spend circuit.
spend_auth_sig_t spendAuthSig; //!< A signature authorizing this spend.
`)

module.exports = ZcashSpendDescription
