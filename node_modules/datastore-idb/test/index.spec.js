/* eslint-env mocha */
'use strict'

const { MountDatastore } = require('datastore-core')
const { Key } = require('interface-datastore')
const { isNode } = require('ipfs-utils/src/env')
const IDBStore = require('../src')

describe('LevelDatastore', function () {
  if (isNode) {
    return
  }
  describe('interface-datastore (idb)', () => {
    const store = new IDBStore('hello')
    require('interface-datastore/src/tests')({
      setup: async () => {
        await store.open()
        return store
      },
      teardown: () => {
        return store.destroy()
      }
    })
  })

  describe('interface-datastore (mount(idb, idb, idb))', () => {
    const one = new IDBStore('one')
    const two = new IDBStore('two')
    const three = new IDBStore('three')
    require('interface-datastore/src/tests')({
      async setup () {
        const d = new MountDatastore([
          {
            prefix: new Key('/a'),
            datastore: one
          },
          {
            prefix: new Key('/q'),
            datastore: two
          },
          {
            prefix: new Key('/z'),
            datastore: three
          }
        ])
        await d.open()
        return d
      },
      teardown () {
        return Promise.all([one.destroy(), two.destroy(), three.destroy()])
      }
    })
  })
})
