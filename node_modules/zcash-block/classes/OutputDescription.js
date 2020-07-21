const { decodeProperties, toHashHex } = require('./class-utils')

/**
 * A class representation of a Zcash output description.
 *
 * This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/OutputDescription')`.
 *
 * @property {Uint8Array|Buffer} cv - a 256-bit block representing the value commitment
 * @property {Uint8Array|Buffer} cm - a 256-bit block representing the note commitment for the output note
 * @property {Uint8Array|Buffer} ephemeralKey - a 256-bit Jubjub public key
 * @property {Uint8Array|Buffer} encCiphertext - a 580 byte ciphertext component for the encrypted output note
 * @property {Uint8Array|Buffer} outCiphertext - a 80 byte ciphertext component for the encrypted output note
 * @property {Uint8Array|Buffer} zkproof - a GrothProof encoded directly as 192 bytes of binary data
 * @class
 */
class ZcashOutputDescription {
  /**
   * Instantiate a new `ZcashOutputDescription`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @param {Uint8Array|Buffer} cv
   * @param {Uint8Array|Buffer} cm
   * @param {Uint8Array|Buffer} ephemeralKey
   * @param {Uint8Array|Buffer} encCiphertext
   * @param {Uint8Array|Buffer} outCiphertext
   * @param {Uint8Array|Buffer} zkproof
   * @constructs ZcashOutputDescription
   */
  constructor (cv, cm, ephemeralKey, encCiphertext, outCiphertext, zkproof) {
    this.cv = cv
    this.cm = cm
    this.ephemeralKey = ephemeralKey
    this.encCiphertext = encCiphertext
    this.outCiphertext = outCiphertext
    this.zkproof = zkproof
  }

  /**
   * Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
   * useful for simplified inspection.
   */
  toJSON () {
    return {
      cv: toHashHex(this.cv),
      cm: toHashHex(this.cm),
      ephemeralKey: toHashHex(this.ephemeralKey),
      encCiphertext: this.encCiphertext.toString('hex'),
      outCiphertext: this.outCiphertext.toString('hex'),
      zkproof: this.zkproof.toString('hex')
    }
  }
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashOutputDescription._nativeName = 'OutputDescription'
// https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/primitives/transaction.h#L48
ZcashOutputDescription._propertiesDescriptor = decodeProperties(`
uint256 cv;                     //!< A value commitment to the value of the output note.
uint256 cm;                     //!< The note commitment for the output note.
uint256 ephemeralKey;           //!< A Jubjub public key.
libzcash::SaplingEncCiphertext encCiphertext; //!< A ciphertext component for the encrypted output note.
libzcash::SaplingOutCiphertext outCiphertext; //!< A ciphertext component for the encrypted output note.
libzcash::GrothProof zkproof;   //!< A zero-knowledge proof using the output circuit.
`)

module.exports = ZcashOutputDescription
