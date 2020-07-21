'use strict'

const Datastore = require('datastore-fs')
const log = require('debug')('repo-migrations:repo:init')

const Key = require('interface-datastore').Key

const versionKey = new Key('/version')
const configKey = new Key('/config')

exports.isRepoInitialized = async function isRepoInitialized (path) {
  let root
  try {
    root = new Datastore(path, { extension: '', createIfMissing: false })
    await root.open()
    const versionCheck = await root.has(versionKey)
    const configCheck = await root.has(configKey)
    if (!versionCheck || !configCheck) {
      log(`Version entry present: ${versionCheck}`)
      log(`Config entry present: ${configCheck}`)
      return false
    }

    return true
  } catch (e) {
    log('While checking if repo is initialized error was thrown: ' + e.message)
    return false
  } finally {
    if (root !== undefined) await root.close()
  }
}
