const test = require('ava')
const toMultiaddr = require('./')

test('should convert URIs to multiaddrs', (t) => {
  const data = [
    ['/ip4/127.0.0.1/tcp/80/http', 'http://127.0.0.1'],
    ['/ip6/fc00::/tcp/80/http', 'http://[fc00::]'],
    ['/ip4/0.0.7.6/tcp/1234', 'tcp://0.0.7.6:1234'],
    ['/ip4/0.0.7.6/tcp/1234/http', 'http://0.0.7.6:1234'],
    ['/ip4/0.0.7.6/tcp/1234/https', 'https://0.0.7.6:1234'],
    ['/ip6/::/tcp/0', 'tcp://[::]:0'],
    ['/ip4/0.0.7.6/udp/1234', 'udp://0.0.7.6:1234'],
    ['/ip6/::/udp/0', 'udp://[::]:0'],
    ['/dns4/protocol.ai/tcp/80', 'tcp://protocol.ai:80'],
    ['/dns4/protocol.ai/tcp/80/http', 'http://protocol.ai:80'],
    ['/dns4/protocol.ai/tcp/80/https', 'https://protocol.ai:80'],
    ['/dns4/ipfs.io/tcp/80/ws', 'ws://ipfs.io'],
    ['/dns4/ipfs.io/tcp/443/wss', 'wss://ipfs.io'],
    ['/dns4/ipfs.io/tcp/80/http', 'http://ipfs.io'],
    ['/dns4/ipfs.io/tcp/443/https', 'https://ipfs.io'],
    ['/ip4/1.2.3.4/tcp/3456/ws', 'ws://1.2.3.4:3456'],
    ['/ip4/1.2.3.4/tcp/3456/wss', 'wss://1.2.3.4:3456'],
    ['/ip6/::/tcp/0/ws', 'ws://[::]:0'],
    ['/ip4/1.2.3.4/tcp/3456/wss', 'wss://1.2.3.4:3456'],
    ['/ip6/::/tcp/0/wss', 'wss://[::]:0']
  ]
  data.forEach(d => {
    const input = d[1]
    const expected = d[0]
    const output = toMultiaddr(input).toString()
    t.is(output, expected, `Converts ${input} to ${expected}`)
  })
})

test('should use the defaultDnsType where provided', (t) => {
  const data = [
    ['/dns4/protocol.ai/tcp/80', 'tcp://protocol.ai:80', { defaultDnsType: 'dns4' }],
    ['/dns6/protocol.ai/tcp/80/http', 'http://protocol.ai:80', { defaultDnsType: 'dns6' }],
    ['/dnsaddr/protocol.ai/tcp/80/https', 'https://protocol.ai:80', { defaultDnsType: 'dnsaddr' }]
  ]

  data.forEach(d => t.is(toMultiaddr(d[1], d[2]).toString(), d[0], `Converts ${d[1]} to ${d[0]} with opts ${d[2]}`))
})

test('should throw for on invalid url', (t) => {
  t.throws(() => {
    toMultiaddr('whoosh.fast')
  }, /Invalid URL/)
})

test('should throw for unknown protocol', (t) => {
  t.throws(() => {
    // NOTE: `data` is a valid uri protocol but isn't a valid multiaddr protocol yet
    toMultiaddr('data:image/svg+xml;base64,test')
  }, 'no protocol with name: data')
})
