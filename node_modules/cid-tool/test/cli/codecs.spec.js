/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const CID = require('cids')
const CIDToolCli = require('./utils/cid-tool-cli')

describe('cli codecs', () => {
  it('should list CID codec names', async () => {
    const cli = CIDToolCli()
    const expectedOutput = Object.keys(CID.codecs).join('\n') + '\n'
    const { stdout } = await cli('codecs')
    expect(stdout).to.equal(expectedOutput)
  })

  it('should list CID codec codes and names', async () => {
    const cli = CIDToolCli()
    const expectedOutput = Object.keys(CID.codecs)
      .map(name => {
        const code = CID.codecs[name]
        return `${code} ${name}`
      })
      .join('\n') + '\n'
    const { stdout } = await cli('codecs --numeric')
    expect(stdout).to.equal(expectedOutput)
  })
})
