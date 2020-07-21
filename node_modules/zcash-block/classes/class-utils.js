const COIN = 100000000

function decodeProperties (propertiesDescriptor) {
  return propertiesDescriptor
    .split('\n')
    .map((l) => l.replace(/\s*(\/\/.*)$/, '')) // trailing whitespace and comments
    .filter(Boolean)
    .map((p) => {
      const ls = p.lastIndexOf(' ')
      const type = ls > -1 ? p.substring(0, ls).replace(/^const /, '') : p
      const name = ls > -1 ? p.substring(ls + 1).replace(/;$/, '') : p
      return { type, name }
    })
}

function toHashHex (hash) {
  const rev = Buffer.alloc(hash.length)
  for (let i = 0; i < hash.length; i++) {
    rev[hash.length - i - 1] = hash[i]
  }
  return rev.toString('hex')
}

module.exports.decodeProperties = decodeProperties
module.exports.toHashHex = toHashHex
module.exports.COIN = COIN
