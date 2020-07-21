'use strict'

const path = require('path')
const debug = require('debug')
const { lock } = require('proper-lockfile')

const log = debug('repo-migrations:repo_fs_lock')
const lockFile = 'repo.lock'

/**
 * Lock the repo in the given dir and given repo's version.
 *
 * @param {int} version
 * @param {string} dir
 * @returns {Promise<Object>}
 */
exports.lock = async (version, dir) => {
  const file = path.join(dir, lockFile)
  log('locking %s', file)
  const release = await lock(dir, { lockfilePath: file })
  return {
    close: () => {
      log('releasing lock %s', file)
      return release()
    }
  }
}
