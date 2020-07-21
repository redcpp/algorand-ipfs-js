'use strict'

const { Buffer } = require('buffer')
const errors = require('../errors')
const repoInit = require('./init')
const Datastore = require('datastore-fs')

const Key = require('interface-datastore').Key

const versionKey = new Key('version')

exports.getVersion = getVersion

/**
 * Function that has responsibility to retrieve version of repo from its root datastore's instance.
 * This function needs to be cross-repo-version functional to be able to fetch any version number,
 * even in case of change of repo's versioning.
 *
 * @param {string} path
 * @returns {Promise<int>}
 */
async function getVersion (path) {
  if (!(await repoInit.isRepoInitialized(path))) {
    throw new errors.NotInitializedRepoError(`Repo in path ${path} is not initialized!`)
  }

  const store = new Datastore(path, { extension: '', createIfMissing: false })
  await store.open()

  const version = parseInt(await store.get(versionKey))
  await store.close()

  return version
}

/**
 * Function for setting a version in cross-repo-version manner.
 *
 * @param {string} path
 * @param {int} version
 * @returns {Promise<void>}
 */
async function setVersion (path, version) {
  const store = new Datastore(path, { extension: '', createIfMissing: false })
  await store.open()
  await store.put(versionKey, Buffer.from(String(version)))
  await store.close()
}

exports.setVersion = setVersion
