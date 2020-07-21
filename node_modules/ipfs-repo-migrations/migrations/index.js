'use strict'

// Do not modify this file manually as it will be overridden when running 'add' CLI command.
// Modify migration-templates.js file

const emptyMigration = {
  description: 'Empty migration.',
  migrate: () => {},
  revert: () => {},
  empty: true
}

module.exports = [
  Object.assign({}, emptyMigration, { version: 7, revert: undefined }),
  Object.assign({}, emptyMigration, { version: 6, revert: undefined }),
  Object.assign({}, emptyMigration, { version: 5, revert: undefined }),
  Object.assign({}, emptyMigration, { version: 4, revert: undefined }),
  Object.assign({}, emptyMigration, { version: 3, revert: undefined }),
  Object.assign({}, emptyMigration, { version: 2, revert: undefined }),
  Object.assign({}, emptyMigration, { version: 1, revert: undefined })
]
