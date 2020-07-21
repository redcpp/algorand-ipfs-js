const classes = require('./classes/')

const classesArray = Object.values(classes)
const classRegistry = classesArray.reduce((p, c) => {
  p[c._nativeName] = c
  return p
}, {})

// https://github.com/zcash/zcash/blob/fa1b656482a38d3a6c97950b35521a9c45da1e9c/src/serialize.h#L288
function readCompactSize (buf, offset) {
  const chSize = buf.readUInt8(offset)
  offset++
  if (chSize < 253) {
    return [chSize, 1]
  } else if (chSize === 253) {
    const nSizeRet = buf.readUInt16LE(offset)
    if (nSizeRet < 253) {
      throw new Error('non-canonical readCompactSize()')
    }
    return [nSizeRet, 3]
  } else if (chSize === 254) {
    const nSizeRet = buf.readUInt32LE(offset)
    if (nSizeRet < 0x10000) {
      throw new Error('non-canonical readCompactSize()')
    }
    return [nSizeRet, 5]
  } else {
    // shouldn't need this, no way are we going to encounter 64-bit ints for decode sizes here
    // const nSizeRet = buf.readBigInt64LE(offset)
    // throw new Error(`readCompactSize() size too large (probably ${nSizeRet})`)
    throw new Error('readCompactSize() size too large')
    /*
    nSizeRet = ser_readdata64(is);
    if (nSizeRet < 0x100000000ULL)
        throw std::ios_base::failure("non-canonical ReadCompactSize()");
    */
  }
}

/**
 * Decode a {@link ZcashBlock} from the raw bytes of the block.
 *
 * Can be used directly as `require('zcash-block').decode()`.
 *
 * @param {Uint8Array|Buffer} buffer - the raw bytes of the block to be decoded.
 * @name ZcashBlock.decode()
 */
function decodeBlock (buf) {
  return _decodeBlock(buf, 'CBlockHeader')
}

/**
 * Decode only the header section of a {@link ZcashBlock} from the raw bytes of the block. This method will exclude the transactions.
 *
 * Can be used directly as `require('zcash-block').decodeBlockHeaderOnly()`.
 *
 * @param {Uint8Array|Buffer} buffer - the raw bytes of the block to be decoded.
 * @name ZcashBlock.decodeBlockHeaderOnly()
 */
function decodeBlockHeaderOnly (buf) {
  return _decodeBlock(buf, 'CBlockHeader__Only')
}

function _decodeBlock (buf, type) {
  let pos = 0
  const state = {}

  const decoder = {
    currentPosition () {
      return pos
    },

    readUInt8 () {
      const i = buf.readUInt8(pos)
      pos++
      return i
    },

    readUInt32LE () {
      const i = buf.readUInt32LE(pos)
      pos += 4
      return i
    },

    readInt32LE () {
      const i = buf.readInt32LE(pos)
      pos += 4
      return i
    },

    readBigInt64LE () {
      // not browser friendly, need to simulate:
      // const i = buf.readBigInt64LE(pos)

      // nicer BigInt version:
      /*
      const lo = BigInt(buf.readInt32LE(pos))
      const hi = BigInt(buf.readInt32LE(pos + 4))
      const i = (BigInt(2) ** BigInt(32)) * hi + lo
      */
      // risky plain, but currently (2019) browser-safe version
      const lo = buf.readInt32LE(pos)
      const hi = buf.readInt32LE(pos + 4)
      const i = (2 ** 32) * hi + lo
      pos += 8
      return i
    },

    slice (len) {
      return buf.slice(pos, pos += len) // eslint-disable-line
    },

    absoluteSlice (start, len) {
      return buf.slice(start, start + len)
    },

    readHash () {
      return decoder.slice(32)
    },

    readCompactInt () {
      const [i, bytesRead] = readCompactSize(buf, pos)
      pos += bytesRead
      return i
    },

    readCompactSlice () {
      return decoder.slice(decoder.readCompactInt())
    },

    readType (type) {
      // console.log('readType', type, pos)

      // a class we know
      if (classRegistry[type]) {
        return decoder.readClass(classRegistry[type])
      }

      // TODO: push some of this specific typedef stuff back into classes rather than
      // hardwiring here

      // fixed byte arrays
      if (type === 'libzcash::GrothProof') {
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/JoinSplit.hpp#L18
        type = `std::array<unsigned char, ${48 + 96 + 48}>`
      } else if (type === 'libzcash::SaplingEncCiphertext') {
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/NoteEncryption.hpp#L20
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/Zcash.h#L27
        type = 'std::array<unsigned char, 580>'
      } else if (type === 'libzcash::SaplingOutCiphertext') {
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/NoteEncryption.hpp#L21
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/Zcash.h#L28
        type = 'std::array<unsigned char, 80>'
      } else if (type === 'spend_auth_sig_t') {
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/primitives/transaction.h#L46
        type = 'std::array<unsigned char, 64>'
      } else if (type === 'ZCNoteEncryption::Ciphertext') {
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/NoteEncryption.hpp#L196
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/NoteEncryption.hpp#L142
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/zcash/Zcash.h#L22
        // CLEN=MLEN+NOTEENCRYPTION_AUTH_BYTES
        // MLEN=ZC_NOTEPLAINTEXT_SIZE (for ZCNoteEncryption)
        // ZC_NOTEPLAINTEXT_SIZE=585
        // NOTEENCRYPTION_AUTH_BYTES=16
        // therefore CLEN=585+16
        type = `std::array<unsigned char, ${585 + 16}>`
      } else if (type === 'joinsplit_sig_t') {
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/primitives/transaction.h#L515
        type = 'std::array<unsigned char, 64>'
      } else if (type === 'binding_sig_t') {
        // https://github.com/zcash/zcash/blob/6da42887f10f9228da4c8c1182174d70b2633284/src/primitives/transaction.h#L516
        type = 'std::array<unsigned char, 64>'
      } else if (type === 'base_blob<256>') {
        type = `std::array<unsigned char, ${256 / 8}>`
      } else if (type === 'base_blob<512>') {
        type = `std::array<unsigned char, ${512 / 8}>`
      }

      if (type.startsWith('std::array<unsigned char,')) {
        const length = parseInt(type.replace(/^std::array<unsigned char,\s*(\d+)>$/, '$1', 10))
        return decoder.slice(length)
      }

      // some rewrites of things that share forms

      if (type === 'std::vector<unsigned char>' || type === 'CScript') {
        // different forms of byte slices
        type = 'compactSlice'
      }
      if (type === 'CAmount') {
        type = 'int64_t'
      }

      // flexible vectors
      const isVector = type.startsWith('std::vector<')
      const vectorType = isVector && type.replace(/std::vector<([^>]+)>/, '$1')
      if (isVector && vectorType) {
        const size = decoder.readCompactInt()
        const list = []
        for (let i = 0; i < size; i++) {
          list.push(decoder.readType(vectorType))
        }
        return list
      }

      // fixed arrays
      const isArray = type.startsWith('std::array<')
      const arrayDesc = isArray && type.match(/std::array<([^,]+),\s*(\d+)>/)
      if (arrayDesc) {
        const arraySize = parseInt(arrayDesc[2], 10)
        const arrayType = arrayDesc[1]
        const array = []
        for (let i = 0; i < arraySize; i++) {
          array.push(decoder.readType(arrayType))
        }
        return array
      }

      // generic stuff
      switch (type) {
        case 'bool':
          return decoder.readUInt8() !== 0
        case 'int32_t':
          return decoder.readInt32LE()
        case 'uint32_t':
          return decoder.readUInt32LE()
        case 'int64_t':
          return decoder.readBigInt64LE()
        case 'uint256':
          return decoder.readHash()
        case 'compactSlice':
          return decoder.readCompactSlice()
        default:
          throw new TypeError(`Don't know how to decode type: ${type} / ${vectorType}`)
      }
    },

    readClass (clazz) {
      const properties = []
      for (const property of clazz._propertiesDescriptor) {
        const type = property.type
        // custom decoder, something a bit fancier than we can handle
        if (type.startsWith('_customDecode') && typeof clazz[type] === 'function') {
          clazz[type](decoder, properties, state)
        } else {
          properties.push(decoder.readType(type))
        }
      }

      const newInstance = new (Function.prototype.bind.apply(clazz, [null, ...properties])) // eslint-disable-line
      return newInstance
    }
  }

  const block = decoder.readType(type)
  return block
}

module.exports = decodeBlock
module.exports.decodeBlockHeaderOnly = decodeBlockHeaderOnly
