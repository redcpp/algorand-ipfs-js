#! /usr/bin/env node

'use strict'

const YargsPromise = require('yargs-promise')
const yargs = require('yargs')
const process = require('process')
const log = require('debug')('repo-migrations:cli')

const commands = require('./commands')

function print (msg = '', newline = true) {
  msg = newline ? msg + '\n' : msg
  process.stdout.write(msg)
}

async function main (args) {
  const cli = yargs()
    .option('repo-path', {
      desc: 'Path to the IPFS repo',
      type: 'string'
    })
    .option('migrations', {
      desc: 'Path to folder with migrations. Default: bundled migrations',
      type: 'string'
    })
    .command(commands.migrate)
    .command(commands.status)
    .command(commands.add)
    .demandCommand(1, 'You need at least one command before continuing')
    .strict()
    .fail((msg, err, yargs) => {
      if (err) {
        throw err // preserve stack
      }

      // Suppress "one command required" error when only help page is to be displayed
      if (args.length > 0) {
        print(msg)
      }

      yargs.showHelp()
    })

  try {
    const { data } = await new YargsPromise(cli).parse(args)
    if (data) print(data)
  } catch (err) {
    log(err)

    // the argument can have a different shape depending on where the error came from
    if (err.message || (err.error && err.error.message)) {
      print(err.message || err.error.message)
    } else {
      print('Unknown error, please re-run the command with DEBUG=repo-migrations:cli to see debug output')
    }

    process.exit(1)
  }
}

main(process.argv.slice(2))
