'use strict'

const os = require('os')
const path = require('path')
const fs = require('fs')
const process = require('process')
const util = require('util')
const readline = require('readline')

const writeFile = util.promisify(fs.writeFile)
const mkdir = util.promisify(fs.mkdir)

const chalk = require('chalk')

const repoVersion = require('./repo/version')
const migratorUtils = require('./utils')
const migrator = require('./index')
const templates = require('./migration-templates')
const migrations = require('../migrations')

function shouldContinueWithIrreversibleMigration () {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(chalk.yellow('There is irreversible migration in the migrations plan. Do you want to continue? [y/N]'), (answer) => {
      rl.close()
      resolve(answer === 'y')
    })
  })
}

function asyncClosure (fnc) {
  return function asyncWrapper ({ resolve, ...options }) {
    resolve(fnc(options))
  }
}

function reportingClosure (action) {
  return (migration, currentlyMigrated, totalToMigrate) =>
    process.stdout.write(`${chalk.green(`[${currentlyMigrated}/${totalToMigrate}]`)} Successfully ${action} ${chalk.bold(migration.version)}: ${migration.description}\n`)
}

async function migrate ({ repoPath, migrations, to, dry, revertOk }) {
  repoPath = repoPath || process.env.IPFS_PATH || path.join(os.homedir(), '.jsipfs')
  migrations = migrations === undefined ? require('../migrations') : require(migrations)

  if (!to) {
    to = migrator.getLatestMigrationVersion(migrations)
  }

  const version = await repoVersion.getVersion(repoPath)

  let action
  if (dry) {
    action = 'loaded migration'
  } else {
    if (!to || (version <= to)) {
      action = 'migrated to version'
    } else {
      action = 'reverted version'
    }
  }

  const options = {
    migrations: migrations,
    toVersion: to,
    ignoreLock: false,
    onProgress: reportingClosure(action),
    isDryRun: dry
  }

  if (version === to) {
    return chalk.yellow('Nothing to migrate! Versions matches')
  } else if (version < to) {
    if (migratorUtils.containsIrreversibleMigration(version, to, migrations)) {
      if (!(await shouldContinueWithIrreversibleMigration())) {
        return 'Migration aborted'
      }
    }

    await migrator.migrate(repoPath, to, options)
  } else if (revertOk) {
    await migrator.revert(repoPath, to, options)
  } else {
    throw new Error(`The migration would revert the repo version from ${version} to ${to}. To revert you must supply '--revert-ok'.`)
  }
}

async function status ({ repoPath, migrations }) {
  repoPath = repoPath || process.env.IPFS_PATH || path.join(os.homedir(), '.jsipfs')

  // Import migrations if set
  if (migrations) {
    migrations = require(migrations)
  }

  const version = await repoVersion.getVersion(repoPath)
  const lastMigrationVersion = migrator.getLatestMigrationVersion(migrations)
  const statusString =
    version < lastMigrationVersion ? chalk.yellow('Repo is out of date') : chalk.green('Nothing to migrate')

  return `${statusString}\nCurrent repo version: ${version}\nLatest migration version: ${lastMigrationVersion}`
}

async function add ({ empty }) {
  const newMigrationVersion = migrator.getLatestMigrationVersion() + 1
  const newMigrationFolder = path.join(__dirname, '..', 'migrations', 'migration-' + newMigrationVersion)

  const migrationsImport = migrations.map((migration) => migration.empty ? `  Object.assign({version: ${parseInt(migration.version)}}, emptyMigration),` : `  require('./migration-${parseInt(migration.version)}'),`)
  if (empty) {
    migrationsImport.push(`  Object.assign({version: ${newMigrationVersion}}, emptyMigration),`)
  } else {
    migrationsImport.push(`  require('./migration-${newMigrationVersion}'),`)
  }
  const migrationsIndexJsContent = templates.migrationsIndexJs
    .replace('{{imports}}', migrationsImport.join('\n'))
  await writeFile(path.join(newMigrationFolder, '..', 'index.js'), migrationsIndexJsContent)

  if (empty) return

  await mkdir(newMigrationFolder)

  const indexJsContent = templates.indexJs
    .replace(/{{version}}/gi, newMigrationVersion)
  await writeFile(path.join(newMigrationFolder, 'index.js'), indexJsContent)
}

module.exports = {
  migrate: {
    command: 'migrate',
    describe: 'Migrate IPFS repo to latest or specific version',
    handler: asyncClosure(migrate),
    builder: yargv => yargv
      .option('to', {
        describe: 'Target version to migrate repo to',
        type: 'number'
      })
      .option('dry', {
        describe: 'Output migration results but don\'t actually perform migration',
        type: 'boolean'
      })
      .option('revert-ok', {
        describe: 'Allow migrating to a lower version (reverting)',
        type: 'boolean'
      })
  },
  status: {
    command: 'status',
    describe: 'Display migration status of IPFS repo',
    handler: asyncClosure(status)
  },
  add: {
    command: 'add',
    describe: 'Bootstrap new migration',
    handler: asyncClosure(add),
    builder: yargv => yargv
      .option('empty', {
        describe: 'Creates empty migration',
        type: 'boolean'
      })
  }
}
