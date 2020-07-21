/* eslint-disable no-console */
'use strict'
const Benchmark = require('benchmark')
const randomBytes = require('iso-random-stream/src/random')
const IDBStore = require('./src')
const LevelStore = require('datastore-level')
const { Key } = require('interface-datastore')

// add tests
// new Benchmark.Suite('simple')
//   .add('simple put idb', {
//     defer: true,
//     fn: async (d) => {
//       const store = new IDBStore('hello1')
//       await store.open()
//       await store.put(new Key('/z/one'), Buffer.from('one'))
//       await store.close()
//       d.resolve()
//     }
//   })
//   .add('simple put level', {
//     defer: true,
//     fn: async (d) => {
//       const store = new LevelStore('hello2')
//       await store.open()
//       await store.put(new Key('/z/one'), Buffer.from('one'))
//       await store.close()
//       d.resolve()
//     }
//   })
// // add listeners
//   .on('cycle', function (event) {
//     console.log(String(event.target))
//   })
//   .on('complete', function () {
//     console.log('Fastest is ' + this.filter('fastest').map('name'))
//   })
// // run async
//   .run({ async: true })

// new Benchmark.Suite('parallel')
//   .add('parallel idb', {
//     defer: true,
//     fn: async (d) => {
//       const store = new IDBStore('parallel idb')
//       await store.open()
//       const data = []
//       for (let i = 0; i < 100; i++) {
//         data.push([new Key(`/z/key${i}`), Buffer.from(`data${i}`)])
//       }

//       await Promise.all(data.map(d => store.put(d[0], d[1])))
//       await Promise.all(data.map(d => store.get(d[0])))
//       await store.close()
//       d.resolve()
//     }
//   })
//   .add('parallel level', {
//     defer: true,
//     fn: async (d) => {
//       const store = new LevelStore('parallel level')
//       await store.open()
//       const data = []
//       for (let i = 0; i < 100; i++) {
//         data.push([new Key(`/z/key${i}`), Buffer.from(`data${i}`)])
//       }

//       await Promise.all(data.map(d => store.put(d[0], d[1])))
//       await Promise.all(data.map(d => store.get(d[0])))
//       await store.close()
//       d.resolve()
//     }
//   })
// // add listeners
//   .on('cycle', function (event) {
//     console.log(String(event.target))
//   })
//   .on('complete', function () {
//     console.log('Fastest is ' + this.filter('fastest').map('name'))
//   })
// // run async
//   .run({ async: true })

new Benchmark.Suite('batch')
  .add('batch idb', {
    defer: true,
    fn: async (d) => {
      const store = new IDBStore('batch idb')
      await store.open()
      const b = store.batch()
      const count = 400
      for (let i = 0; i < count; i++) {
        b.put(new Key(`/a/hello${i}`), randomBytes(32))
        b.put(new Key(`/q/hello${i}`), randomBytes(64))
        b.put(new Key(`/z/hello${i}`), randomBytes(128))
      }

      await b.commit()

      const total = async iterable => {
        let count = 0
        for await (const _ of iterable) count++ // eslint-disable-line
        return count
      }

      await total(store.query({ prefix: '/a' }))
      await total(store.query({ prefix: '/z' }))
      await total(store.query({ prefix: '/q' }))
      await store.close()
      d.resolve()
    }
  })
  .add('batch level', {
    defer: true,
    fn: async (d) => {
      const store = new LevelStore('batch level')
      await store.open()
      const b = store.batch()
      const count = 400
      for (let i = 0; i < count; i++) {
        b.put(new Key(`/a/hello${i}`), randomBytes(32))
        b.put(new Key(`/q/hello${i}`), randomBytes(64))
        b.put(new Key(`/z/hello${i}`), randomBytes(128))
      }

      await b.commit()

      const total = async iterable => {
        let count = 0
        for await (const _ of iterable) count++ // eslint-disable-line
        return count
      }

      await total(store.query({ prefix: '/a' }))
      await total(store.query({ prefix: '/z' }))
      await total(store.query({ prefix: '/q' }))
      await store.close()
      d.resolve()
    }
  })
// add listeners
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
// run async
  .run({ async: true })
