'use strict'

const { Buffer } = require('buffer')
const { openDB, deleteDB } = require('idb')
const { Key, Errors, utils, Adapter } = require('interface-datastore')
const { filter, sortAll } = utils

const isStrictTypedArray = (arr) => {
  return (
    arr instanceof Int8Array ||
    arr instanceof Int16Array ||
    arr instanceof Int32Array ||
    arr instanceof Uint8Array ||
    arr instanceof Uint8ClampedArray ||
    arr instanceof Uint16Array ||
    arr instanceof Uint32Array ||
    arr instanceof Float32Array ||
    arr instanceof Float64Array
  )
}

const typedarrayToBuffer = (arr) => {
  if (isStrictTypedArray(arr)) {
    // To avoid a copy, use the typed array's underlying ArrayBuffer to back new Buffer
    let buf = Buffer.from(arr.buffer)
    if (arr.byteLength !== arr.buffer.byteLength) {
      // Respect the "view", i.e. byteOffset and byteLength, without doing a copy
      buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
    }
    return buf
  } else {
    // Pass through all other types to `Buffer.from`
    return Buffer.from(arr)
  }
}

const str2ab = (str) => {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

const queryIt = async function * (q, store, location) {
  const range = q.prefix ? self.IDBKeyRange.bound(str2ab(q.prefix), str2ab(q.prefix + '\xFF'), false, true) : undefined
  let cursor = await store.transaction(location).store.openCursor(range)
  let limit = 0

  if (cursor && q.offset && q.offset > 0) {
    cursor = await cursor.advance(q.offset)
  }

  while (cursor) {
    // limit
    if (q.limit !== undefined && q.limit === limit) {
      return
    }
    limit++

    const key = new Key(Buffer.from(cursor.key))
    if (q.keysOnly) {
      yield { key }
    } else {
      const value = Buffer.from(cursor.value)
      yield { key, value }
    }
    cursor = await cursor.continue()
  }
}

class IdbDatastore extends Adapter {
  constructor (location, options = {}) {
    super()

    this.store = null
    this.options = options
    this.location = options.prefix + location
    this.version = options.version || 1
  }

  async open () {
    if (this.store !== null) {
      return
    }

    const location = this.location
    try {
      this.store = await openDB(this.location, this.version, {
        upgrade (db) {
          db.createObjectStore(location)
        }
      })
    } catch (err) {
      throw Errors.dbOpenFailedError(err)
    }
  }

  async put (key, val) {
    if (this.store === null) {
      throw new Error('Datastore needs to be opened.')
    }
    try {
      await this.store.put(this.location, val, key.toBuffer())
    } catch (err) {
      throw Errors.dbWriteFailedError(err)
    }
  }

  async get (key) {
    if (this.store === null) {
      throw new Error('Datastore needs to be opened.')
    }
    let value
    try {
      value = await this.store.get(this.location, key.toBuffer())
    } catch (err) {
      throw Errors.dbWriteFailedError(err)
    }

    if (!value) {
      throw Errors.notFoundError()
    }

    return typedarrayToBuffer(value)
  }

  async has (key) {
    if (this.store === null) {
      throw new Error('Datastore needs to be opened.')
    }
    try {
      await this.get(key)
    } catch (err) {
      if (err.code === 'ERR_NOT_FOUND') return false
      throw err
    }
    return true
  }

  async delete (key) {
    if (this.store === null) {
      throw new Error('Datastore needs to be opened.')
    }
    try {
      await this.store.delete(this.location, key.toBuffer())
    } catch (err) {
      throw Errors.dbDeleteFailedError(err)
    }
  }

  batch () {
    const puts = []
    const dels = []

    return {
      put (key, value) {
        puts.push([key.toBuffer(), value])
      },
      delete (key) {
        dels.push(key.toBuffer())
      },
      commit: async () => {
        if (this.store === null) {
          throw new Error('Datastore needs to be opened.')
        }
        const tx = this.store.transaction(this.location, 'readwrite')
        const store = tx.store
        await Promise.all(puts.map(p => store.put(p[1], p[0])))
        await Promise.all(dels.map(p => store.delete(p)))
        await tx.done
      }
    }
  }

  query (q) {
    if (this.store === null) {
      throw new Error('Datastore needs to be opened.')
    }
    let it = queryIt(q, this.store, this.location)

    if (Array.isArray(q.filters)) {
      it = q.filters.reduce((it, f) => filter(it, f), it)
    }

    if (Array.isArray(q.orders)) {
      it = q.orders.reduce((it, f) => sortAll(it, f), it)
    }

    return it
  }

  close () {
    if (this.store === null) {
      throw new Error('Datastore needs to be opened.')
    }
    this.store.close()
    this.store = null
  }

  destroy () {
    return deleteDB(this.location)
  }
}

module.exports = IdbDatastore
