# uri-to-multiaddr

[![Build Status](https://travis-ci.org/multiformats/js-uri-to-multiaddr.svg?branch=master)](https://travis-ci.org/multiformats/js-uri-to-multiaddr) [![dependencies Status](https://david-dm.org/multiformats/js-uri-to-multiaddr/status.svg)](https://david-dm.org/multiformats/js-uri-to-multiaddr) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Convert a URI to a [Multiaddr](https://multiformats.io/multiaddr/): https://multiformats.io -> /dns4/multiformats.io/tcp/443/https

## Install

```sh
npm install uri-to-multiaddr
```

## Usage

```js
const toMultiaddr = require('uri-to-multiaddr')

console.log(toMultiaddr('https://protocol.ai'))
// -> /dns4/protocol.ai/tcp/443/https
```

Domain names can represent one of

- `/dns4` - domain resolves to an ipv4 address (**default**)
- `/dns6` - domain resolves to an ipv6 address
- `/dnsaddr` - domain has a [DNSLink](https://docs.ipfs.io/guides/concepts/dnslink/) TXT record pointing to an IPFS CID

This library assumes `/dns4` when it finds a domain name in the input string.
It makes no attempt query DNS. To override the default assumption, you can pass
in an options object as the second parameter to override it:

```js
const toMultiaddr = require('uri-to-multiaddr')

console.log(toMultiaddr('https://protocol.ai'), { defaultDnsType: 'dns6' })
// -> /dns6/protocol.ai/tcp/443/https
```

See [test.js](./test.js) for the currently supported conversions.

**Note**: `uri-to-multiaddr` will throw if the passed URI:
  - is not a valid, according the WHATWG URL spec implementation used.
  - is not supported yet

## Related

- [multiaddr-to-uri](https://github.com/multiformats/js-multiaddr-to-uri) - convert it back again

## Contribute

Feel free to dive in! [Open an issue](https://github.com/multiformats/js-uri-to-multiaddr/issues/new) or submit PRs.

## License

[MIT](LICENSE) © TABLEFLIP
