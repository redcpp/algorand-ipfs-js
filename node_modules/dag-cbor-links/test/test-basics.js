const cbor = require('ipld-dag-cbor').util
const links = require('../')
const {test} = require('tap')
const CID = require('cids')

test('no links', t => {
  t.plan(1)
  let buff = cbor.serialize({})
  t.same(Array.from(links(buff)).length, 0)
})

test('obj and array with links', t => {
  t.plan(2)
  let _cid = new CID('bafyreiahlcrtsoo5g5cdpwf5t76zgc5ulcxruzftrkuf3wqzo4stzrmagu')
  let node = {
    mylink: _cid,
    myarray: [ _cid ],
    mynull: null
  }

  let buffer = cbor.serialize(node)
  let ret = Array.from(links(buffer))
  t.same(ret[0], ['mylink', _cid])
  t.same(ret[1], ['myarray/0', _cid])
})
