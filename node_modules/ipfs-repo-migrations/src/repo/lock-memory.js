'use strict'

const debug = require('debug')

const log = debug('repo-migrations:repo_mem_lock')

const lockFile = 'repo.lock'

const LOCKS = {}

/**
 * Lock the repo in the given dir and for given repo version.
 * @param {int} version
 * @param {string} dir
 * @returns {Promise<Object>}
 */
exports.lock = async function lock (version, dir) { // eslint-disable-line require-await
  const file = dir + '/' + lockFile
  log('locking %s', file)

  if (LOCKS[file] === true) {
    throw Error(`There is already present lock for: ${file}`)
  }

  LOCKS[file] = true
  return {
    close () {
      if (LOCKS[file]) {
        log('releasing lock %s', file)
        delete LOCKS[file]
      }
    }
  }
}
