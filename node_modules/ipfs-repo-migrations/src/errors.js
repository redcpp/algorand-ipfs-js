'use strict'

/**
 * Exception raised when trying to revert migration that is not possible
 * to revert.
 */
class NonReversibleMigrationError extends Error {
  constructor (message) {
    super(message)
    this.name = 'NonReversibleMigrationError'
    this.code = 'ERR_NON_REVERSIBLE_MIGRATION'
    this.message = message
  }
}

NonReversibleMigrationError.code = 'ERR_NON_REVERSIBLE_MIGRATION'
exports.NonReversibleMigrationError = NonReversibleMigrationError

/**
 * Exception raised when repo is not initialized.
 */
class NotInitializedRepoError extends Error {
  constructor (message) {
    super(message)
    this.name = 'NotInitializedRepoError'
    this.code = 'ERR_NOT_INITIALIZED_REPO'
    this.message = message
  }
}

NotInitializedRepoError.code = 'ERR_NOT_INITIALIZED_REPO'
exports.NotInitializedRepoError = NotInitializedRepoError

/**
 * Exception raised when required parameter is not provided.
 */
class RequiredParameterError extends Error {
  constructor (message) {
    super(message)
    this.name = 'RequiredParameterError'
    this.code = 'ERR_REQUIRED_PARAMETER'
    this.message = message
  }
}

RequiredParameterError.code = 'ERR_REQUIRED_PARAMETER'
exports.RequiredParameterError = RequiredParameterError

/**
 * Exception raised when value is not valid.
 */
class InvalidValueError extends Error {
  constructor (message) {
    super(message)
    this.name = 'InvalidValueError'
    this.code = 'ERR_INVALID_VALUE'
    this.message = message
  }
}

InvalidValueError.code = 'ERR_INVALID_VALUE'
exports.InvalidValueError = InvalidValueError
