// Lowest-cost migration: talk to the Kubo HTTP RPC API directly via Node's
// built-in fetch instead of the deprecated `ipfs` / `ipfs-http-client` packages.
// Defaults assume a local Kubo daemon for writes (`http://127.0.0.1:5001`) and
// the public ipfs.io gateway for reads. Both endpoints are overridable via env
// vars (`IPFS_API_URL`, `IPFS_GATEWAY_URL`) so any kubo-compatible service
// (Pinata, web3.storage gateways, etc.) can be plugged in without code changes.

const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

const DEFAULT_API_URL = process.env.IPFS_API_URL || 'http://127.0.0.1:5001'
const DEFAULT_GATEWAY_URL = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io'

module.exports = class IPFSWrapper {
  constructor(encryptionPassword = undefined, opts = {}) {
    if (encryptionPassword) {
      this.encryptionPassword = crypto
        .createHash('sha256')
        .update(String(encryptionPassword))
        .digest('base64')
        .substr(0, 32)
    }
    this.apiUrl = (opts.apiUrl || DEFAULT_API_URL).replace(/\/$/, '')
    this.gatewayUrl = (opts.gatewayUrl || DEFAULT_GATEWAY_URL).replace(/\/$/, '')
  }

  async init() {
    // Best-effort version probe against the configured Kubo API.
    try {
      const res = await fetch(`${this.apiUrl}/api/v0/version`, { method: 'POST' })
      if (res.ok) {
        const v = await res.json()
        console.log('IPFS (Kubo) version:', v.Version)
      } else {
        console.warn(
          `IPFS API at ${this.apiUrl} responded ${res.status}. ` +
            'Uploads will fail without a reachable Kubo daemon.'
        )
      }
    } catch (e) {
      console.warn(
        `Could not reach IPFS API at ${this.apiUrl}: ${e.message}. ` +
          'Start a local Kubo daemon or set IPFS_API_URL.'
      )
    }
  }

  async uploadFile(filepath) {
    let fileContents = fs.readFileSync(filepath)

    if (this.encryptionPassword) {
      console.log('Encrypting file')
      fileContents = this._encryptBuffer(fileContents)
    }

    const filename = path.basename(filepath)
    const form = new FormData()
    form.append('file', new Blob([fileContents]), filename)

    const res = await fetch(
      `${this.apiUrl}/api/v0/add?pin=true&cid-version=1`,
      { method: 'POST', body: form }
    )
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`IPFS add failed: HTTP ${res.status} ${body}`)
    }
    // Kubo returns one JSON object per added entry, separated by newlines.
    const text = await res.text()
    const lines = text.trim().split('\n').filter(Boolean)
    const last = JSON.parse(lines[lines.length - 1])

    const fileAdded = { path: last.Name || filename, cid: last.Hash }
    console.log('Added file:', fileAdded.path, fileAdded.cid)
    return fileAdded
  }

  async downloadFile({ cid, filename }) {
    console.log('Looking for contents of hash:', cid)

    // Prefer the public read-only gateway: no daemon required, works anywhere.
    const url = `${this.gatewayUrl}/ipfs/${cid}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`IPFS gateway fetch failed: HTTP ${res.status} for ${url}`)
    }
    let fileContents = Buffer.from(await res.arrayBuffer())

    if (this.encryptionPassword) {
      console.log('Unencrypting file')
      fileContents = this._decryptBuffer(fileContents)
    }

    console.log('File contents retrieved with buffer length:', fileContents.length)

    fs.writeFileSync(`_${filename}`, fileContents)

    return fileContents
  }

  _encryptBuffer(buffer) {
    console.log('Running encryption on file before uploading')
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionPassword, iv)
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
    return Buffer.from(iv.toString('hex') + ':' + encrypted.toString('hex'))
  }

  _decryptBuffer(buffer) {
    console.log('Running decryption on downloaded file')
    const textParts = String(buffer).split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionPassword, iv)
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()])
    return decrypted
  }
}
