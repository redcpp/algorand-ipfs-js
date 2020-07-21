const cbor = require('ipld-dag-cbor').util
const CID = require('cids')

const links = (obj, path = []) => {
  if (Buffer.isBuffer(obj)) {
    obj = cbor.deserialize(obj)
  }
  return (function * () {
    for (let key of Object.keys(obj)) {
      let _path = path.slice()
      _path.push(key)
      let val = obj[key]
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          for (let i = 0; i < val.length; i++) {
            let __path = _path.slice()
            __path.push(i)
            let o = val[i]
            if (CID.isCID(o)) {
              yield [__path.join('/'), o]
            } else if (typeof o === 'object') {
              yield * links(o, _path)
            }
          }
        } else {
          if (CID.isCID(val)) {
            yield [_path.join('/'), val]
          } else {
            yield * links(val, _path)
          }
        }
      }
    }
  })()
}

module.exports = links
