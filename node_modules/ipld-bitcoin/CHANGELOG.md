<a name="0.3.1"></a>
## [0.3.1](https://github.com/ipld/js-ipld-bitcoin/compare/v0.3.0...v0.3.1) (2020-01-13)


### Bug Fixes

* **package:** update multicodec to version 1.0.0 ([fb8226e](https://github.com/ipld/js-ipld-bitcoin/commit/fb8226e))
* **package:** update multihashing-async to version 0.8.0 ([5ef0714](https://github.com/ipld/js-ipld-bitcoin/commit/5ef0714))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipld/js-ipld-bitcoin/compare/v0.2.0...v0.3.0) (2019-05-10)


### Bug Fixes

* **package:** update cids to version 0.7.0 ([6b2745e](https://github.com/ipld/js-ipld-bitcoin/commit/6b2745e))


### BREAKING CHANGES

* **package:** Returned v1 CIDs now default to base32 encoding

Previous versions returned a base58 encoded string when `toString()`/
`toBaseEncodedString()` was called on a CIDv1. It now returns a base32
encoded string.



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipld/js-ipld-bitcoin/compare/v0.1.9...v0.2.0) (2019-05-08)


### Bug Fixes

* **package:** update bitcoinjs-lib to version 5.0.0 ([ef99508](https://github.com/ipld/js-ipld-bitcoin/commit/ef99508))
* **package:** update cids to version 0.6.0 ([cd36640](https://github.com/ipld/js-ipld-bitcoin/commit/cd36640))
* **package:** update multihashing-async to version 0.6.0 ([9dc7bb7](https://github.com/ipld/js-ipld-bitcoin/commit/9dc7bb7))


### Features

* new IPLD Format API ([1a799aa](https://github.com/ipld/js-ipld-bitcoin/commit/1a799aa))


### BREAKING CHANGES

* The API is now async/await based

There are numerous changes, the most significant one is that the API
is no longer callback based, but it using async/await.

For the full new API please see the [IPLD Formats spec].

[IPLD Formats spec]: https://github.com/ipld/interface-ipld-format



<a name="0.1.9"></a>
## [0.1.9](https://github.com/ipld/js-ipld-bitcoin/compare/v0.1.8...v0.1.9) (2018-12-03)


### Bug Fixes

* **package:** update bitcoinjs-lib to version 4.0.2 ([64cde6c](https://github.com/ipld/js-ipld-bitcoin/commit/64cde6c))
* remove git-validate as a dependency ([84d0ffc](https://github.com/ipld/js-ipld-bitcoin/commit/84d0ffc))



<a name="0.1.8"></a>
## [0.1.8](https://github.com/ipld/js-ipld-bitcoin/compare/v0.1.7...v0.1.8) (2018-10-15)


### Bug Fixes

* add missing async dependency ([c070fdf](https://github.com/ipld/js-ipld-bitcoin/commit/c070fdf))



<a name="0.1.7"></a>
## [0.1.7](https://github.com/ipld/js-ipld-bitcoin/compare/v0.1.6...v0.1.7) (2018-07-19)


### Bug Fixes

* use block headers only ([ef05359](https://github.com/ipld/js-ipld-bitcoin/commit/ef05359))



<a name="0.1.6"></a>
## [0.1.6](https://github.com/ipld/js-ipld-bitcoin/compare/v0.1.5...v0.1.6) (2018-06-29)


### Bug Fixes

* do not ignore cid.options ([#20](https://github.com/ipld/js-ipld-bitcoin/issues/20)) ([177ddc5](https://github.com/ipld/js-ipld-bitcoin/commit/177ddc5))
* move dirty-chai to dev dependencies ([3805fc1](https://github.com/ipld/js-ipld-bitcoin/commit/3805fc1))
* use multihasing-async [#14](https://github.com/ipld/js-ipld-bitcoin/issues/14) ([#19](https://github.com/ipld/js-ipld-bitcoin/issues/19)) ([77354ac](https://github.com/ipld/js-ipld-bitcoin/commit/77354ac))


### Features

* add defaultHashAlg ([#17](https://github.com/ipld/js-ipld-bitcoin/issues/17)) ([6e28d3e](https://github.com/ipld/js-ipld-bitcoin/commit/6e28d3e))
* add util.cid options ([#18](https://github.com/ipld/js-ipld-bitcoin/issues/18)) ([eab262f](https://github.com/ipld/js-ipld-bitcoin/commit/eab262f))



<a name="0.1.5"></a>
## [0.1.5](https://github.com/ipld/js-ipld-bitcoin/compare/v0.1.4...v0.1.5) (2018-02-14)


### Bug Fixes

* path never start with a slash ([d790c9b](https://github.com/ipld/js-ipld-bitcoin/commit/d790c9b))
* **tests:** Aegir changed fixture API ([c7e6c79](https://github.com/ipld/js-ipld-bitcoin/commit/c7e6c79))



<a name="0.1.4"></a>
## [0.1.4](https://github.com/ipld/js-ipld-bitcoin/compare/v0.1.3...v0.1.4) (2018-02-01)


### Bug Fixes

* export `multicodec` property ([8e6ec75](https://github.com/ipld/js-ipld-bitcoin/commit/8e6ec75))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/ipld/js-ipld-bitcoin/compare/v0.1.2...v0.1.3) (2018-01-22)


### Bug Fixes

* add proper error handling for util API ([dacb7b1](https://github.com/ipld/js-ipld-bitcoin/commit/dacb7b1))
* the option in tree() is called `values` ([568c075](https://github.com/ipld/js-ipld-bitcoin/commit/568c075))


### Features

* Add resolve() method ([25cef82](https://github.com/ipld/js-ipld-bitcoin/commit/25cef82))
* Add tree() method ([685889d](https://github.com/ipld/js-ipld-bitcoin/commit/685889d))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/ipld/js-ipld-bitcoin/compare/v0.1.1...v0.1.2) (2018-01-10)



<a name="0.1.1"></a>
## 0.1.1 (2018-01-10)


### Features

* initial commit ([525d003](https://github.com/ipld/js-ipld-btc/commit/525d003))



