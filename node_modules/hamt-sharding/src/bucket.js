'use strict'

const SparseArray = require('sparse-array')
const wrapHash = require('./consumable-hash')

const defaultOptions = {
  bits: 8
}

class Bucket {
  constructor (options, parent, posAtParent) {
    this._options = Object.assign({}, defaultOptions, options)
    this._popCount = 0
    this._parent = parent
    this._posAtParent = posAtParent

    if (!this._options.hashFn) {
      throw new Error('please define an options.hashFn')
    }

    // make sure we only wrap options.hashFn once in the whole tree
    if (!this._options.hash) {
      this._options.hash = wrapHash(this._options.hashFn)
    }
    this._children = new SparseArray()
  }

  static isBucket (o) {
    return o instanceof Bucket
  }

  async put (key, value) {
    const place = await this._findNewBucketAndPos(key)

    await place.bucket._putAt(place, key, value)
  }

  async get (key) {
    const child = await this._findChild(key)

    if (child) {
      return child.value
    }
  }

  async del (key) {
    const place = await this._findPlace(key)
    const child = place.bucket._at(place.pos)

    if (child && child.key === key) {
      place.bucket._delAt(place.pos)
    }
  }

  leafCount () {
    return this._children.compactArray().reduce((acc, child) => {
      if (child instanceof Bucket) {
        return acc + child.leafCount()
      }

      return acc + 1
    }, 0)
  }

  childrenCount () {
    return this._children.length
  }

  onlyChild () {
    return this._children.get(0)
  }

  * eachLeafSeries () {
    const children = this._children.compactArray()

    for (const child of children) {
      if (child instanceof Bucket) {
        for (const c2 of child.eachLeafSeries()) {
          yield c2
        }
      } else {
        yield child
      }
    }
  }

  serialize (map, reduce) {
    // serialize to a custom non-sparse representation
    return reduce(this._children.reduce((acc, child, index) => {
      if (child) {
        if (child instanceof Bucket) {
          acc.push(child.serialize(map, reduce))
        } else {
          acc.push(map(child, index))
        }
      }
      return acc
    }, []))
  }

  asyncTransform (asyncMap, asyncReduce) {
    return asyncTransformBucket(this, asyncMap, asyncReduce)
  }

  toJSON () {
    return this.serialize(mapNode, reduceNodes)
  }

  prettyPrint () {
    return JSON.stringify(this.toJSON(), null, '  ')
  }

  tableSize () {
    return Math.pow(2, this._options.bits)
  }

  async _findChild (key) {
    const result = await this._findPlace(key)
    const child = result.bucket._at(result.pos)

    if (child && child.key === key) {
      return child
    }
  }

  async _findPlace (key) {
    const hashValue = this._options.hash(key)
    const index = await hashValue.take(this._options.bits)

    const child = this._children.get(index)

    if (child instanceof Bucket) {
      return child._findPlace(hashValue)
    }

    return {
      bucket: this,
      pos: index,
      hash: hashValue
    }
  }

  async _findNewBucketAndPos (key) {
    const place = await this._findPlace(key)
    const child = place.bucket._at(place.pos)

    if (child && child.key !== key) {
      // conflict

      const bucket = new Bucket(this._options, place.bucket, place.pos)
      place.bucket._putObjectAt(place.pos, bucket)

      // put the previous value
      const newPlace = await bucket._findPlace(child.hash)
      newPlace.bucket._putAt(newPlace, child.key, child.value)

      return bucket._findNewBucketAndPos(place.hash)
    }

    // no conflict, we found the place
    return place
  }

  _putAt (place, key, value) {
    this._putObjectAt(place.pos, {
      key: key,
      value: value,
      hash: place.hash
    })
  }

  _putObjectAt (pos, object) {
    if (!this._children.get(pos)) {
      this._popCount++
    }
    this._children.set(pos, object)
  }

  _delAt (pos) {
    if (this._children.get(pos)) {
      this._popCount--
    }
    this._children.unset(pos)
    this._level()
  }

  _level () {
    if (this._parent && this._popCount <= 1) {
      if (this._popCount === 1) {
        // remove myself from parent, replacing me with my only child
        const onlyChild = this._children.find(exists)

        if (!(onlyChild instanceof Bucket)) {
          const hash = onlyChild.hash
          hash.untake(this._options.bits)
          const place = {
            pos: this._posAtParent,
            hash: hash
          }
          this._parent._putAt(place, onlyChild.key, onlyChild.value)
        }
      } else {
        this._parent._delAt(this._posAtParent)
      }
    }
  }

  _at (index) {
    return this._children.get(index)
  }
}

function exists (o) {
  return Boolean(o)
}

function mapNode (node, index) {
  return node.key
}

function reduceNodes (nodes) {
  return nodes
}

async function asyncTransformBucket (bucket, asyncMap, asyncReduce) {
  const output = []

  for (const child of bucket._children.compactArray()) {
    if (child instanceof Bucket) {
      await asyncTransformBucket(child, asyncMap, asyncReduce)
    } else {
      const mappedChildren = await asyncMap(child)

      output.push({
        bitField: bucket._children.bitField(),
        children: mappedChildren
      })
    }

    return asyncReduce(output)
  }
}

module.exports = Bucket
