<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipld/js-ipld-zcash/compare/v0.4.0...v0.4.1) (2020-01-13)


### Bug Fixes

* **package:** update multicodec to version 1.0.0 ([8d9ddea](https://github.com/ipld/js-ipld-zcash/commit/8d9ddea))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipld/js-ipld-zcash/compare/v0.3.0...v0.4.0) (2019-10-29)

### Bug Fixes

* **package:** update multihashing-async to version 0.8.0 ([6a3869d](https://github.com/ipld/js-ipld-zcash/commit/6a3869d))


### Features

* switch to zcash-block for decoding ([22bc170](https://github.com/ipld/js-ipld-zcash/commit/22bc170))


### BREAKING CHANGES

* Only deserialization is supported

It is not possible anymore to serialize a Zcash Block. It will throw an
"Unsupported operation" error.



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipld/js-ipld-zcash/compare/v0.2.0...v0.3.0) (2019-05-10)


### Bug Fixes

* **package:** update cids to version 0.7.0 ([2f8b700](https://github.com/ipld/js-ipld-zcash/commit/2f8b700))


### BREAKING CHANGES

* **package:** Returned v1 CIDs now default to base32 encoding

Previous versions returned a base58 encoded string when `toString()`/
`toBaseEncodedString()` was called on a CIDv1. It now returns a base32
encoded string.



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipld/js-ipld-zcash/compare/v0.1.6...v0.2.0) (2019-05-08)


### Bug Fixes

* **package:** update cids to version 0.6.0 ([866cfb7](https://github.com/ipld/js-ipld-zcash/commit/866cfb7))
* **package:** update multihashing-async to version 0.6.0 ([b7e3801](https://github.com/ipld/js-ipld-zcash/commit/b7e3801))


### Features

* new IPLD Format API ([68f3685](https://github.com/ipld/js-ipld-zcash/commit/68f3685))


### BREAKING CHANGES

* The API is now async/await based

There are numerous changes, the most significant one is that the API
is no longer callback based, but it using async/await.

For the full new API please see the [IPLD Formats spec].

[IPLD Formats spec]: https://github.com/ipld/interface-ipld-format



<a name="0.1.6"></a>
## [0.1.6](https://github.com/ipld/js-ipld-zcash/compare/v0.1.5...v0.1.6) (2018-09-12)


### Bug Fixes

* add missing async dependency ([57e85c7](https://github.com/ipld/js-ipld-zcash/commit/57e85c7))



<a name="0.1.5"></a>
## [0.1.5](https://github.com/ipld/js-ipld-zcash/compare/v0.1.4...v0.1.5) (2018-07-19)


### Bug Fixes

* use block headers only ([fdfe4e4](https://github.com/ipld/js-ipld-zcash/commit/fdfe4e4))



<a name="0.1.4"></a>
## [0.1.4](https://github.com/ipld/js-ipld-zcash/compare/v0.1.3...v0.1.4) (2018-06-29)


### Bug Fixes

* do not ignore cid.options ([#15](https://github.com/ipld/js-ipld-zcash/issues/15)) ([32a89f3](https://github.com/ipld/js-ipld-zcash/commit/32a89f3))
* use multihashing-async ([#12](https://github.com/ipld/js-ipld-zcash/issues/12)) ([dfffd96](https://github.com/ipld/js-ipld-zcash/commit/dfffd96)), closes [#7](https://github.com/ipld/js-ipld-zcash/issues/7)


### Features

* add defaultHashAlg ([#10](https://github.com/ipld/js-ipld-zcash/issues/10)) ([8ecdb53](https://github.com/ipld/js-ipld-zcash/commit/8ecdb53))
* add util.cid options ([#11](https://github.com/ipld/js-ipld-zcash/issues/11)) ([8384849](https://github.com/ipld/js-ipld-zcash/commit/8384849)), closes [ipld/interface-ipld-format#40](https://github.com/ipld/interface-ipld-format/issues/40)



<a name="0.1.3"></a>
## [0.1.3](https://github.com/ipld/js-ipld-zcash/compare/v0.1.2...v0.1.3) (2018-02-14)


### Bug Fixes

* path never start with a slash ([ce90dcd](https://github.com/ipld/js-ipld-zcash/commit/ce90dcd))
* **tests:** Aegir changed fixture API ([dfe7b3d](https://github.com/ipld/js-ipld-zcash/commit/dfe7b3d))



<a name="0.1.2"></a>
## 0.1.2 (2018-01-30)


### Bug Fixes

* add proper error handling for util API ([dacb7b1](https://github.com/ipld/js-ipld-zcash/commit/dacb7b1))
* export `multicodec` property ([6a1e949](https://github.com/ipld/js-ipld-zcash/commit/6a1e949))
* the option in tree() is called `values` ([568c075](https://github.com/ipld/js-ipld-zcash/commit/568c075))


### Features

* Add resolve() method ([25cef82](https://github.com/ipld/js-ipld-zcash/commit/25cef82))
* Add tree() method ([685889d](https://github.com/ipld/js-ipld-zcash/commit/685889d))
* implementation of IPLD format for Zcash ([47d950f](https://github.com/ipld/js-ipld-zcash/commit/47d950f))
* initial commit ([525d003](https://github.com/ipld/js-ipld-zcash/commit/525d003))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipld/js-ipld-zcash/compare/v0.1.2...v0.1.1) (2018-01-30)


### Bug Fixes

* add proper error handling for util API ([dacb7b1](https://github.com/ipld/js-ipld-zcash/commit/dacb7b1))
* export `multicodec` property ([6a1e949](https://github.com/ipld/js-ipld-zcash/commit/6a1e949))
* the option in tree() is called `values` ([568c075](https://github.com/ipld/js-ipld-zcash/commit/568c075))


### Features

* Add resolve() method ([25cef82](https://github.com/ipld/js-ipld-zcash/commit/25cef82))
* Add tree() method ([685889d](https://github.com/ipld/js-ipld-zcash/commit/685889d))
* implementation of IPLD format for Zcash ([47d950f](https://github.com/ipld/js-ipld-zcash/commit/47d950f))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipld/js-ipld-zcash/compare/v0.1.2...v0.1.1) (2018-01-30)


### Bug Fixes

* add proper error handling for util API ([dacb7b1](https://github.com/ipld/js-ipld-zcash/commit/dacb7b1))
* export `multicodec` property ([6a1e949](https://github.com/ipld/js-ipld-zcash/commit/6a1e949))
* the option in tree() is called `values` ([568c075](https://github.com/ipld/js-ipld-zcash/commit/568c075))


### Features

* Add resolve() method ([25cef82](https://github.com/ipld/js-ipld-zcash/commit/25cef82))
* Add tree() method ([685889d](https://github.com/ipld/js-ipld-zcash/commit/685889d))
* implementation of IPLD format for Zcash ([47d950f](https://github.com/ipld/js-ipld-zcash/commit/47d950f))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipld/js-ipld-zcash/compare/v0.1.2...v0.1.1) (2018-01-30)


### Bug Fixes

* add proper error handling for util API ([dacb7b1](https://github.com/ipld/js-ipld-zcash/commit/dacb7b1))
* export `multicodec` property ([6a1e949](https://github.com/ipld/js-ipld-zcash/commit/6a1e949))
* the option in tree() is called `values` ([568c075](https://github.com/ipld/js-ipld-zcash/commit/568c075))


### Features

* Add resolve() method ([25cef82](https://github.com/ipld/js-ipld-zcash/commit/25cef82))
* Add tree() method ([685889d](https://github.com/ipld/js-ipld-zcash/commit/685889d))
* implementation of IPLD format for Zcash ([47d950f](https://github.com/ipld/js-ipld-zcash/commit/47d950f))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/ipld/js-ipld-zcash/compare/v0.1.1...v0.1.2) (2018-01-10)



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipld/js-ipld-zcash/compare/525d003...v0.1.1) (2018-01-10)


### Features

* initial commit ([525d003](https://github.com/ipld/js-ipld-zcash/commit/525d003))



