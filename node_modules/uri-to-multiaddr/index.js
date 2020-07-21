const isIp = require('is-ip')
const Multiaddr = require('multiaddr')

/**
 * Convert a URI to a multiaddr
 *
 *        http://foobar.com => /dns4/foobar.com/tcp/80/http
 *       https://foobar.com => /dns4/foobar.com/tcp/443/https
 *  https://foobar.com:5001 => /dns4/foobar.com/tcp/5001/https
 *   https://127.0.0.1:8080 => /ip4/127.0.0.1/tcp/8080/https
 *        http://[::1]:8080 => /ip6/::1/tcp/8080/http
 *    tcp://foobar.com:8080 => /dns4/foobar.com/tcp/8080
 *    udp://foobar.com:8080 => /dns4/foobar.com/udp/8080
 */

function multiaddrFromUri (uriStr, opts) {
  opts = opts || {}
  const defaultDnsType = opts.defaultDnsType || 'dns4'
  const { scheme, hostname, port } = parseUri(uriStr)
  const parts = [
    tupleForHostname(hostname, defaultDnsType),
    tupleForPort(port, scheme),
    tupleForScheme(scheme)
  ]
  const multiaddrStr = '/' + parts
    .filter(x => !!x)
    .reduce((a, b) => a.concat(b))
    .join('/')

  return Multiaddr(multiaddrStr)
}

function parseUri (uriStr) {
  // Use the WHATWG URL global, in node >= 10 and the browser
  let { protocol, hostname, port } = new URL(uriStr)
  const scheme = protocol.slice(0, -1)
  if (!port && port !== 0) {
    port = portForProtocol(scheme)
  }
  return { scheme, hostname, port }
}

function tupleForHostname (hostname, defaultDnsType) {
  if (!hostname) return null
  if (isIp.v4(hostname)) {
    return ['ip4', hostname]
  }
  if (isIp.v6(hostname)) {
    return ['ip6', hostname]
  }
  // literal ipv6 in url should be wrapped in square brackets [x:y:z]
  // https://www.ietf.org/rfc/rfc2732.txt
  if (hostname[0] === '[') {
    const trimmed = hostname.substring(1, hostname.length - 1)
    if (isIp.v6(trimmed)) {
      return ['ip6', trimmed]
    }
  }
  // assumes that any non-ip hostname is a dns4 address.
  return [defaultDnsType, hostname]
}

function tupleForPort (port, scheme) {
  if (!port) return null
  if (scheme === 'udp') {
    return ['udp', port]
  }
  return ['tcp', port]
}

function tupleForScheme (scheme) {
  if (scheme.match(/^tcp$|^udp$/)) {
    return null
  }
  return [scheme]
}

function portForProtocol (protocol) {
  if (!protocol) return null
  const portFor = {
    http: '80',
    https: '443',
    ws: '80',
    wss: '443'
  }
  return portFor[protocol]
}

module.exports = multiaddrFromUri
