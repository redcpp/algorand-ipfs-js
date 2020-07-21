const { decodeProperties } = require('./class-utils')

const SAPLING_TX_VERSION = 4

/**
 * A class representation of a Zcash Transaction's joinsplit, which may or may not be present for a given transaction.
 *
 * This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/JoinSplitDescription')`.
 *
 * @property {BigInt} vpubOld - a representation of an amount / value
 * @property {BigInt} vpubNew - a representation of an amount / value
 * @property {Uint8Array|Buffer} anchor - a 256-bit hash anchoring the joinsplit's position in the commitment tree
 * @property {Array.<Uint8Array>|Array.<Buffer>} nullifiers - two 256-bit blocks derived from secrets in the note
 * @property {Array.<Uint8Array>|Array.<Buffer>} commitments - two 256-bit blocks representing the spend commitments
 * @property {Uint8Array|Buffer} ephemeralKey - a 256-bit hash
 * @property {Uint8Array|Buffer} randomSeed - - a 256-bit block
 * @property {Array.<Uint8Array>|Array.<Buffer>} macs - two 256-bit hashes required to verify this joinsplit
 * @property {Uint8Array|Buffer|PHGRProof} sproutProof - either a GrothProof encoded directly as 192 bytes of binary data or a decoded {@link PHGRProof}, depending on the block version.
 * @property {Uint8Array|Buffer} ciphertexts - two ciphertexts of 601 bytes each which encode trapdoors, values and other information that the recipient needs, including a memo field.
 * @class
 */
class ZcashJoinSplitDescription {
  /**
   * Instantiate a new `ZcashJoinSplitDescription`.
   *
   * See the class properties for expanded information on these parameters.
   *
   * @param {BigInt} vpubOld
   * @param {BigInt} vpubNew
   * @param {Uint8Array|Buffer} anchor
   * @param {Array.<Uint8Array>|Array.<Buffer>} nullifiers
   * @param {Array.<Uint8Array>|Array.<Buffer>} commitments
   * @param {Uint8Array|Buffer} ephemeralKey
   * @param {Uint8Array|Buffer} randomSeed
   * @param {Array.<Uint8Array>|Array.<Buffer>} macs
   * @param {Uint8Array|Buffer|PHGRProof} sproutProof
   * @param {Uint8Array|Buffer} ciphertexts
   * @constructs ZcashJoinSplitDescription
   */
  constructor (vpubOld, vpubNew, anchor, nullifiers, commitments, ephemeralKey, randomSeed, macs, sproutProof, ciphertexts) {
    this.vpubOld = vpubOld
    this.vpubNew = vpubNew
    this.anchor = anchor
    this.nullifiers = nullifiers
    this.commitments = commitments
    this.ephemeralKey = ephemeralKey
    this.randomSeed = randomSeed
    this.macs = macs
    this.sproutProof = sproutProof
    this.ciphertexts = ciphertexts
  }

  /**
   * Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
   * useful for simplified inspection.
   */
  toJSON () {
    return Object.assign({}, this, {
      vpubOld: Number(this.vpubOld),
      vpubNew: Number(this.vpubNew)
    })
  }
}

// -------------------------------------------------------------------------------------------------------
// Custom decoder descriptors and functions below here, used by ../decoder.js

ZcashJoinSplitDescription._nativeName = 'JSDescription'
// https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/primitives/transaction.h#L179
ZcashJoinSplitDescription._propertiesDescriptor = decodeProperties(`
CAmount vpub_old;
CAmount vpub_new;

// JoinSplits are always anchored to a root in the note
// commitment tree at some point in the blockchain
// history or in the history of the current
// transaction.
uint256 anchor;

// Nullifiers are used to prevent double-spends. They
// are derived from the secrets placed in the note
// and the secret spend-authority key known by the
// spender.
std::array<uint256, 2> nullifiers;

// Note commitments are introduced into the commitment
// tree, blinding the public about the values and
// destinations involved in the JoinSplit. The presence of
// a commitment in the note commitment tree is required
// to spend it.
std::array<uint256, 2> commitments;

// Ephemeral key
uint256 ephemeralKey;

// Random seed
uint256 randomSeed;

// MACs
// The verification of the JoinSplit requires these MACs
// to be provided as an input.
std::array<uint256, 2> macs;

// JoinSplit proof
// This is a zk-SNARK which ensures that this JoinSplit is valid.
//libzcash::SproutProof proof;
_customDecodeSproutProof

// Ciphertexts
// These contain trapdoors, values and other information
// that the recipient needs, including a memo field. It
// is encrypted using the scheme implemented in crypto/NoteEncryption.cpp
std::array<ZCNoteEncryption::Ciphertext, 2> ciphertexts
`)

// libzcash::SproutProof is a boost::variant<PHGRProof, GrothProof> (boost::varint is a union container)
// custom serialization occurs @ https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/primitives/transaction.h#L276-L286
// and https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/primitives/transaction.h#L166-L177
// typedef std::array<unsigned char, GROTH_PROOF_SIZE> GrothProof;
ZcashJoinSplitDescription._customDecodeSproutProof = function (decoder, properties, state) {
  const useGroth = state.fOverwintered && state.nVersion >= SAPLING_TX_VERSION
  // if useGroth, unserialize as libzcash::GrothProof, otherwise as libzcash::PHGRProof
  if (useGroth) {
    properties.push(decoder.readType('libzcash::GrothProof'))
  } else {
    properties.push(decoder.readType('PHGRProof'))
  }
}

module.exports = ZcashJoinSplitDescription
