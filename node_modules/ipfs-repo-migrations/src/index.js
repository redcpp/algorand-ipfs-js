'use strict'

const defaultMigrations = require('../migrations')
const repoVersion = require('./repo/version')
const repoLock = require('./repo/lock')
const errors = require('./errors')

const log = require('debug')('repo-migrations:migrator')

exports.getCurrentRepoVersion = repoVersion.getVersion
exports.errors = errors

/**
 * Returns the version of latest migration.
 * If no migrations are present returns 0.
 *
 * @param {array?} migrations - Array of migrations to consider. If undefined, the bundled migrations are used. Mainly for testing purpose.
 * @returns {int}
 */
function getLatestMigrationVersion (migrations) {
  migrations = migrations || defaultMigrations

  if (!Array.isArray(migrations) || migrations.length === 0) {
    return 0
  }

  return migrations[migrations.length - 1].version
}

exports.getLatestMigrationVersion = getLatestMigrationVersion

/**
 * Main function to execute forward migrations.
 * It acquire lock on the provided path before doing any migrations.
 *
 * Signature of the progress callback is: function(migrationObject: object, currentMigrationNumber: int, totalMigrationsCount: int)
 *
 * @param {string} path - Path to initialized (!) JS-IPFS repo
 * @param {int} toVersion - Version to which the repo should be migrated.
 * @param {Object} options - Options for migration
 * @param {boolean?} options.ignoreLock - Won't lock the repo for applying the migrations. Use with caution.
 * @param {object?} options.repoOptions - Options that are passed to migrations, that can use them to correctly construct datastore. Options are same like for IPFSRepo.
 * @param {function?} options.onProgress - Callback which will be called after each executed migration to report progress
 * @param {boolean?} options.isDryRun - Allows to simulate the execution of the migrations without any effect.
 * @param {array?} options.migrations - Array of migrations to migrate. If undefined, the bundled migrations are used. Mainly for testing purpose.
 * @returns {Promise<void>}
 */
async function migrate (path, toVersion, { ignoreLock = false, repoOptions, onProgress, isDryRun = false, migrations }) {
  migrations = migrations || defaultMigrations
  onProgress = onProgress || (() => {})

  if (!path) {
    throw new errors.RequiredParameterError('Path argument is required!')
  }

  if (!toVersion) {
    throw new errors.RequiredParameterError('toVersion argument is required!')
  }

  if (!Number.isInteger(toVersion) || toVersion <= 0) {
    throw new errors.InvalidValueError('Version has to be positive integer!')
  }

  const currentVersion = await repoVersion.getVersion(path)

  if (currentVersion === toVersion) {
    log('Nothing to migrate.')
    return
  }

  if (currentVersion > toVersion) {
    throw new errors.InvalidValueError(`Current repo's version (${currentVersion}) is higher then toVersion (${toVersion}), you probably wanted to revert it?`)
  }

  verifyAvailableMigrations(migrations, currentVersion, toVersion)

  let lock
  if (!isDryRun && !ignoreLock) lock = await repoLock.lock(currentVersion, path)

  try {
    let counter = 0
    const totalMigrations = toVersion - currentVersion
    for (const migration of migrations) {
      if (toVersion !== undefined && migration.version > toVersion) {
        break
      }
      if (migration.version <= currentVersion) {
        continue
      }

      counter++
      log(`Migrating version ${migration.version}`)
      try {
        if (!isDryRun) await migration.migrate(path, repoOptions)
      } catch (e) {
        const lastSuccessfullyMigratedVersion = migration.version - 1
        log(`An exception was raised during execution of migration. Setting the repo's version to last successfully migrated version: ${lastSuccessfullyMigratedVersion}`)
        await repoVersion.setVersion(path, lastSuccessfullyMigratedVersion)

        e.message = `During migration to version ${migration.version} exception was raised: ${e.message}`
        throw e
      }

      onProgress(migration, counter, totalMigrations) // Reports on migration process
      log(`Migrating to version ${migration.version} finished`)
    }

    if (!isDryRun) await repoVersion.setVersion(path, toVersion || getLatestMigrationVersion(migrations))
    log('Repo successfully migrated ', toVersion !== undefined ? `to version ${toVersion}!` : 'to latest version!')
  } finally {
    if (!isDryRun && !ignoreLock) await lock.close()
  }
}

exports.migrate = migrate

/**
 * Main function to execute backward migration (reversion).
 * It acquire lock on the provided path before doing any migrations.
 *
 * Signature of the progress callback is: function(migrationObject: object, currentMigrationNumber: int, totalMigrationsCount: int)
 *
 * @param {string} path - Path to initialized (!) JS-IPFS repo
 * @param {int} toVersion - Version to which the repo will be reverted.
 * @param {Object} options - Options for the reversion
 * @param {function?} options.onProgress - Callback which will be called after each reverted migration to report progress
 * @param {object?} options.repoOptions - Options that are passed to migrations, that can use them to correctly construct datastore. Options are same like for IPFSRepo.
 * @param {boolean?} options.isDryRun - Allows to simulate the execution of the reversion without any effects. Make sense to utilize onProgress with this argument.
 * @param {boolean?} options.ignoreLock - Won't lock the repo for reverting the migrations. Use with caution.
 * @param {array?} options.migrations - Array of migrations to migrate. If undefined, the bundled migrations are used. Mainly for testing purpose.
 * @returns {Promise<void>}
 */
async function revert (path, toVersion, { ignoreLock = false, repoOptions, onProgress, isDryRun = false, migrations }) {
  migrations = migrations || defaultMigrations
  onProgress = onProgress || (() => {})

  if (!path) {
    throw new errors.RequiredParameterError('Path argument is required!')
  }

  if (!toVersion) {
    throw new errors.RequiredParameterError('When reverting migrations, you have to specify to which version to revert!')
  }

  if (!Number.isInteger(toVersion) || toVersion <= 0) {
    throw new errors.InvalidValueError('Version has to be positive integer!')
  }

  const currentVersion = await repoVersion.getVersion(path)
  if (currentVersion === toVersion) {
    log('Nothing to revert.')
    return
  }

  if (currentVersion < toVersion) {
    throw new errors.InvalidValueError(`Current repo's version (${currentVersion}) is lower then toVersion (${toVersion}), you probably wanted to migrate it?`)
  }

  verifyAvailableMigrations(migrations, toVersion, currentVersion, true)

  let lock
  if (!isDryRun && !ignoreLock) lock = await repoLock.lock(currentVersion, path)

  log(`Reverting from version ${currentVersion} to ${toVersion}`)
  try {
    let counter = 0
    const totalMigrations = currentVersion - toVersion
    const reversedMigrationArray = migrations.slice().reverse()
    for (const migration of reversedMigrationArray) {
      if (migration.version <= toVersion) {
        break
      }

      if (migration.version > currentVersion) {
        continue
      }

      counter++
      log(`Reverting migration version ${migration.version}`)
      try {
        if (!isDryRun) await migration.revert(path, repoOptions)
      } catch (e) {
        const lastSuccessfullyRevertedVersion = migration.version
        log(`An exception was raised during execution of migration. Setting the repo's version to last successfully reverted version: ${lastSuccessfullyRevertedVersion}`)
        await repoVersion.setVersion(path, lastSuccessfullyRevertedVersion)

        e.message = `During reversion to version ${migration.version} exception was raised: ${e.message}`
        throw e
      }

      onProgress(migration, counter, totalMigrations) // Reports on migration process
      log(`Reverting to version ${migration.version} finished`)
    }

    if (!isDryRun) await repoVersion.setVersion(path, toVersion)
    log(`All migrations successfully reverted to version ${toVersion}!`)
  } finally {
    if (!isDryRun && !ignoreLock) await lock.close()
  }
}

exports.revert = revert

/**
 * Function checks if all migrations in given range are available.
 *
 * @param {array} migrations
 * @param {int} fromVersion
 * @param {int} toVersion
 * @param {boolean} checkReversibility - Will additionally checks if all the migrations in the range are reversible
 * @returns {void}
 */
function verifyAvailableMigrations (migrations, fromVersion, toVersion, checkReversibility = false) {
  let migrationCounter = 0
  for (const migration of migrations) {
    if (migration.version > toVersion) {
      break
    }

    if (migration.version > fromVersion) {
      if (checkReversibility && !migration.revert) {
        throw new errors.NonReversibleMigrationError(`It is not possible to revert to version ${fromVersion} because migration version ${migration.version} is not reversible. Cancelling reversion.`)
      }

      migrationCounter++
    }
  }

  if (migrationCounter !== (toVersion - fromVersion)) {
    throw new errors.InvalidValueError(`The ipfs-repo-migrations package does not have all migration to migrate from version ${fromVersion} to ${toVersion}`)
  }
}
