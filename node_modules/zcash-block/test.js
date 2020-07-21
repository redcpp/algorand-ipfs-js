const fs = require('fs').promises
const path = require('path')
const assert = require('assert')

const ZcashBlock = require('./')

async function test () {
  // the blocks in ./fixtures are a random(ish) sample of blocks from the beginning (including the
  // genesis block) to the date of authoring (August 2019), so they cover a good range of formats

  const fixtureBlocks = (await fs.readdir(path.join(__dirname, 'fixtures')))
    .map((f) => f.endsWith('.hex') && f.substring(0, f.length - 4))
    .filter(Boolean)

  for (const blockHash of fixtureBlocks) {
    console.log('testing', blockHash)

    const block = Buffer.from(await fs.readFile(path.join(__dirname, 'fixtures', `${blockHash}.hex`), 'utf8'), 'hex')
    const blockData = require(path.join(__dirname, 'fixtures', `${blockHash}.json`))

    const decoded = ZcashBlock.decode(block)
    const serializable = decoded.toSerializable()
    // console.log('decoded', JSON.stringify(serializable, null, 2))

    // check difficulty separately, floating point is hard
    assert.ok(Math.abs(serializable.difficulty - blockData.difficulty) < 0.00000001, `decoded difficulty=${serializable.difficulty}, expected difficulty=${blockData.difficulty}`)
    serializable.difficulty = Math.round(serializable.difficulty)
    blockData.difficulty = Math.round(blockData.difficulty)

    // can't test these things as they come from having a full blockchain state to work with
    // while we are only working with isolated blocks
    'anchor height chainwork confirmations valuePools nextblockhash'.split(' ').forEach((p) => { delete blockData[p] })

    assert.deepStrictEqual(serializable, blockData)
  }
}

test().catch((err) => {
  console.error(err)
  process.exit(1)
}).then(() => {
  console.log('😀👌')
})
