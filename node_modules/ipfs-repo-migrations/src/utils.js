'use strict'

const Datastore = require('datastore-fs')

exports.getDatastoreAndOptions = function getDatastoreAndOptions (options, key, defaultDatastore = Datastore) {
  let StorageBackend, storageBackendOptions
  if (options !== undefined &&
    options.storageBackends !== undefined &&
    options.storageBackends[key] !== undefined
  ) {
    StorageBackend = options.storageBackends[key]
  } else {
    StorageBackend = defaultDatastore
  }

  if (options !== undefined &&
    options.storageBackendOptions !== undefined &&
    options.storageBackendOptions[key] !== undefined
  ) {
    storageBackendOptions = options.storageBackendOptions[key]
  } else {
    storageBackendOptions = {}
  }

  return {
    StorageBackend: StorageBackend,
    storageOptions: storageBackendOptions
  }
}

exports.containsIrreversibleMigration = function containsIrreversibleMigration (from, to, migrations) {
  return migrations
    .filter(migration => migration.version > from && migration.version <= to)
    .some(migration => migration.revert === undefined)
}
