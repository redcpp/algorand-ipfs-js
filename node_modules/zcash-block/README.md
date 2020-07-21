# Zcash block interface for JavaScript

[![NPM](https://nodei.co/npm/zcash-block.svg)](https://nodei.co/npm/zcash-block/)

A collection of JavaScript classes representing the data contained within **[Zcash](https://z.cash/)** blocks along with a **decoder** for the binary Zcash block representation.

[`ZcashBlock`](#ZcashBlock) is the primary export for this package, it can be used to construct an in-memory representation of a Zcash block along with the child classes (below), or use the [`ZcashBlock.decode()`](#ZcashBlock__decode____) method to decode from block's raw bytes.

Raw block data, hex encoded, can be obtained via an online API (e.g. https://zcashnetwork.info/api/rawblock/00000001b69a0aedf2e35e4fd072f435835ec48d3acd95ec6a0bcc1cfa12135c) or via the CLI (e.g. `zcash-cli getblock 00000001b69a0aedf2e35e4fd072f435835ec48d3acd95ec6a0bcc1cfa12135c 0`).

Running `JSON.stringify()` on a decoded `ZcashBlock` instance should result in the same data provided by the Zcash CLI, (e.g. `zcash-cli getblock 00000001b69a0aedf2e35e4fd072f435835ec48d3acd95ec6a0bcc1cfa12135c`) minus some additional properties that are only available when the block is attached to the full blockchain (`anchor`, `height`, `chainwork`, `confirmations`, `valuePools`, `nextblockhash`).

## API

### Contents

 * [`ZcashBlock.decode()`](#ZcashBlock__decode____)
 * [`ZcashBlock.decodeBlockHeaderOnly()`](#ZcashBlock__decodeBlockHeaderOnly____)
 * [`class ZcashBlock`](#ZcashBlock)
   * [Constructor: `ZcashBlock(version, previousblockhash, merkleroot, finalsaplingroot, time, bits, nonce, solution, hash, transactions)`](#ZcashBlock_new)
 * [`ZcashBlock#toSerializable()`](#ZcashBlock_toSerializable)
 * [`class ZcashCompressedG1`](#ZcashCompressedG1)
   * [Constructor: `ZcashCompressedG1(yLsb, x)`](#ZcashCompressedG1_new)
 * [`class ZcashCompressedG2`](#ZcashCompressedG2)
   * [Constructor: `ZcashCompressedG2(yLsb, x)`](#ZcashCompressedG2_new)
 * [`class ZcashFq`](#ZcashFq)
   * [Constructor: `ZcashFq(data)`](#ZcashFq_new)
 * [`class ZcashFq2`](#ZcashFq2)
   * [Constructor: `ZcashFq2(data)`](#ZcashFq2_new)
 * [`class ZcashJoinSplitDescription`](#ZcashJoinSplitDescription)
   * [Constructor: `ZcashJoinSplitDescription(vpubOld, vpubNew, anchor, nullifiers, commitments, ephemeralKey, randomSeed, macs, sproutProof, ciphertexts)`](#ZcashJoinSplitDescription_new)
 * [`ZcashJoinSplitDescription#toJSON()`](#ZcashJoinSplitDescription_toJSON)
 * [`class ZcashOutPoint`](#ZcashOutPoint)
   * [Constructor: `ZcashOutPoint()`](#ZcashOutPoint_new)
 * [`ZcashOutPoint#toJSON()`](#ZcashOutPoint_toJSON)
 * [`class ZcashOutputDescription`](#ZcashOutputDescription)
   * [Constructor: `ZcashOutputDescription(cv, cm, ephemeralKey, encCiphertext, outCiphertext, zkproof)`](#ZcashOutputDescription_new)
 * [`ZcashOutputDescription#toJSON()`](#ZcashOutputDescription_toJSON)
 * [`class ZcashPHGRProof`](#ZcashPHGRProof)
   * [Constructor: `ZcashPHGRProof(gA, gAprime, gB, gBprime, gC, gCprime, gK, gH, yLsb)`](#ZcashPHGRProof_new)
 * [`class ZcashSpendDescription`](#ZcashSpendDescription)
   * [Constructor: `ZcashSpendDescription(cv, anchor, nullifier, rk, zkproof, spendAuthSig)`](#ZcashSpendDescription_new)
 * [`ZcashSpendDescription#toJSON()`](#ZcashSpendDescription_toJSON)
 * [`class ZcashTransaction`](#ZcashTransaction)
   * [Constructor: `ZcashTransaction()`](#ZcashTransaction_new)
 * [`ZcashTransaction#toJSON()`](#ZcashTransaction_toJSON)
 * [`ZcashTransaction#toSerializable()`](#ZcashTransaction_toSerializable)
 * [`class ZcashTransactionIn`](#ZcashTransactionIn)
   * [Constructor: `ZcashTransactionIn(prevout, scriptSig, sequence)`](#ZcashTransactionIn_new)
 * [`ZcashTransactionIn#toJSON()`](#ZcashTransactionIn_toJSON)
 * [`class ZcashTransactionOut`](#ZcashTransactionOut)
   * [Constructor: `ZcashTransactionOut(value, scriptPubKey)`](#ZcashTransactionOut_new)
 * [`ZcashTransactionOut#toJSON()`](#ZcashTransactionOut_toJSON)

<a name="ZcashBlock__decode____"></a>
### `ZcashBlock.decode()`

Decode a [`ZcashBlock`](#ZcashBlock) from the raw bytes of the block.

Can be used directly as `require('zcash-block').decode()`.

**Parameters:**

* **`buffer`** _(`Uint8Array|Buffer`)_: the raw bytes of the block to be decoded.

<a name="ZcashBlock__decodeBlockHeaderOnly____"></a>
### `ZcashBlock.decodeBlockHeaderOnly()`

Decode only the header section of a [`ZcashBlock`](#ZcashBlock) from the raw bytes of the block. This method will exclude the transactions.

Can be used directly as `require('zcash-block').decodeBlockHeaderOnly()`.

**Parameters:**

* **`buffer`** _(`Uint8Array|Buffer`)_: the raw bytes of the block to be decoded.

<a name="ZcashBlock"></a>
### `class ZcashBlock`

A class representation of a Zcash Block, parent for all of the data included in the raw block data
in addition to some information that can be calculated based on that data. Properties are intended to
match the names that are provided by the Zcash API (hence the casing and some strange names).

Exported as the main object, available as `require('zcash-block')`.

**Properties:**

* **`version`** _(`number`)_: positive integer
* **`previousblockhash`** _(`Uint8Array|Buffer`)_: 256-bit hash
* **`merkleroot`** _(`Uint8Array|Buffer`)_: 256-bit hash
* **`finalsaplingroot`** _(`Uint8Array|Buffer`)_: 256-bit hash
* **`time`** _(`number`)_: seconds since epoch
* **`bits`** _(`number`)_
* **`nonce`** _(`Uint8Array|Buffer`)_: 256-bit hash
* **`solution`** _(`Uint8Array|Buffer`)_
* **`hash`** _(`Uint8Array|Buffer`)_: 256-bit hash, a double SHA2-256 hash of all bytes making up this block (calculated)
* **`transactions`** _(`Array.<ZcashTransaction>`)_
* **`difficulty`** _(`number`)_: the difficulty for this block (calculated)

<a name="ZcashBlock_new"></a>
#### Constructor: `ZcashBlock(version, previousblockhash, merkleroot, finalsaplingroot, time, bits, nonce, solution, hash, transactions)`

Instantiate a new `ZcashBlock`.

See the class properties for expanded information on these parameters.

<a name="ZcashBlock_toSerializable"></a>
### `ZcashBlock#toSerializable()`

Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
useful for simplified inspection.

<a name="ZcashCompressedG1"></a>
### `class ZcashCompressedG1`

A class representation of a property of a Zcash transaction joinsplit proof.

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/CompressedG1')`.

**Properties:**

* **`yLsb`** _(`boolean`)_
* **`x`** _(`Fq`)_

<a name="ZcashCompressedG1_new"></a>
#### Constructor: `ZcashCompressedG1(yLsb, x)`

Instantiate a new `ZcashCompressedG1`.

See the class properties for expanded information on these parameters.

<a name="ZcashCompressedG2"></a>
### `class ZcashCompressedG2`

A class representation of a property of a Zcash transaction joinsplit proof.

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/CompressedG2')`.

**Properties:**

* **`yLsb`** _(`boolean`)_
* **`x`** _(`Fq2`)_

<a name="ZcashCompressedG2_new"></a>
#### Constructor: `ZcashCompressedG2(yLsb, x)`

Instantiate a new `ZcashCompressedG2`.

See the class properties for expanded information on these parameters.

<a name="ZcashFq"></a>
### `class ZcashFq`

A class representation of a property of a Zcash transaction joinsplit proof. Used by [`ZcashCompressedG1`](#ZcashCompressedG1).

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/Fq')`.

**Properties:**

* **`data`** _(`Uint8Array|Buffer`)_: a 256-bit block of data

<a name="ZcashFq_new"></a>
#### Constructor: `ZcashFq(data)`

Instantiate a new `ZcashFq`.

See the class properties for expanded information on these parameters.

<a name="ZcashFq2"></a>
### `class ZcashFq2`

A class representation of a property of a Zcash transaction joinsplit proof. Used by [`ZcashCompressedG2`](#ZcashCompressedG2).

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/Fq2')`.

**Properties:**

* **`data`** _(`Uint8Array|Buffer`)_: a 512-bit block of data

<a name="ZcashFq2_new"></a>
#### Constructor: `ZcashFq2(data)`

Instantiate a new `ZcashFq2`.

See the class properties for expanded information on these parameters.

<a name="ZcashJoinSplitDescription"></a>
### `class ZcashJoinSplitDescription`

A class representation of a Zcash Transaction's joinsplit, which may or may not be present for a given transaction.

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/JoinSplitDescription')`.

**Properties:**

* **`vpubOld`** _(`BigInt`)_: a representation of an amount / value
* **`vpubNew`** _(`BigInt`)_: a representation of an amount / value
* **`anchor`** _(`Uint8Array|Buffer`)_: a 256-bit hash anchoring the joinsplit's position in the commitment tree
* **`nullifiers`** _(`Array.<Uint8Array>|Array.<Buffer>`)_: two 256-bit blocks derived from secrets in the note
* **`commitments`** _(`Array.<Uint8Array>|Array.<Buffer>`)_: two 256-bit blocks representing the spend commitments
* **`ephemeralKey`** _(`Uint8Array|Buffer`)_: a 256-bit hash
* **`randomSeed`** _(`Uint8Array|Buffer`)_: - a 256-bit block
* **`macs`** _(`Array.<Uint8Array>|Array.<Buffer>`)_: two 256-bit hashes required to verify this joinsplit
* **`sproutProof`** _(`Uint8Array|Buffer|PHGRProof`)_: either a GrothProof encoded directly as 192 bytes of binary data or a decoded [`PHGRProof`](#PHGRProof), depending on the block version.
* **`ciphertexts`** _(`Uint8Array|Buffer`)_: two ciphertexts of 601 bytes each which encode trapdoors, values and other information that the recipient needs, including a memo field.

<a name="ZcashJoinSplitDescription_new"></a>
#### Constructor: `ZcashJoinSplitDescription(vpubOld, vpubNew, anchor, nullifiers, commitments, ephemeralKey, randomSeed, macs, sproutProof, ciphertexts)`

Instantiate a new `ZcashJoinSplitDescription`.

See the class properties for expanded information on these parameters.

<a name="ZcashJoinSplitDescription_toJSON"></a>
### `ZcashJoinSplitDescription#toJSON()`

Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
useful for simplified inspection.

<a name="ZcashOutPoint"></a>
### `class ZcashOutPoint`

A class representation of a Zcash OutPoint for a [`ZcashTransactionIn`](#ZcashTransactionIn).

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/OutPoint')`.

**Properties:**

* **`hash`** _(`Uint8Array|Buffer`)_
* **`n`** _(`number`)_

<a name="ZcashOutPoint_new"></a>
#### Constructor: `ZcashOutPoint()`

Instantiate a new `ZcashOutPoint`.

See the class properties for expanded information on these parameters.

<a name="ZcashOutPoint_toJSON"></a>
### `ZcashOutPoint#toJSON()`

Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
useful for simplified inspection.

<a name="ZcashOutputDescription"></a>
### `class ZcashOutputDescription`

A class representation of a Zcash output description.

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/OutputDescription')`.

**Properties:**

* **`cv`** _(`Uint8Array|Buffer`)_: a 256-bit block representing the value commitment
* **`cm`** _(`Uint8Array|Buffer`)_: a 256-bit block representing the note commitment for the output note
* **`ephemeralKey`** _(`Uint8Array|Buffer`)_: a 256-bit Jubjub public key
* **`encCiphertext`** _(`Uint8Array|Buffer`)_: a 580 byte ciphertext component for the encrypted output note
* **`outCiphertext`** _(`Uint8Array|Buffer`)_: a 80 byte ciphertext component for the encrypted output note
* **`zkproof`** _(`Uint8Array|Buffer`)_: a GrothProof encoded directly as 192 bytes of binary data

<a name="ZcashOutputDescription_new"></a>
#### Constructor: `ZcashOutputDescription(cv, cm, ephemeralKey, encCiphertext, outCiphertext, zkproof)`

Instantiate a new `ZcashOutputDescription`.

See the class properties for expanded information on these parameters.

<a name="ZcashOutputDescription_toJSON"></a>
### `ZcashOutputDescription#toJSON()`

Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
useful for simplified inspection.

<a name="ZcashPHGRProof"></a>
### `class ZcashPHGRProof`

A class representation of a Zcash transaction joinsplit proof.

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/PHGRProof')`.

**Properties:**

* **`gA`** _(`CompressedG1`)_
* **`gAprime`** _(`CompressedG1`)_
* **`gB`** _(`CompressedG2`)_
* **`gBprime`** _(`CompressedG1`)_
* **`gC`** _(`CompressedG1`)_
* **`gCprime`** _(`CompressedG1`)_
* **`gK`** _(`CompressedG1`)_
* **`gH`** _(`CompressedG1`)_
* **`yLsb`** _(`boolean`)_

<a name="ZcashPHGRProof_new"></a>
#### Constructor: `ZcashPHGRProof(gA, gAprime, gB, gBprime, gC, gCprime, gK, gH, yLsb)`

Instantiate a new `ZcashPHGRProof`.

<a name="ZcashSpendDescription"></a>
### `class ZcashSpendDescription`

A class representation of a Zcash spend description.

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/SpendDescription')`.

**Properties:**

* **`cv`** _(`Uint8Array|Buffer`)_: a 256-bit value commitment to the value of the input note
* **`anchor`** _(`Uint8Array|Buffer`)_: a 256-bit Merkle root of the Sapling note commitment tree at some block height in the past
* **`nullifier`** _(`Uint8Array|Buffer`)_: a 256-bit nullifier of the input note
* **`rk`** _(`Uint8Array|Buffer`)_: a 256-bit randomized public key for spendAuthSig
* **`zkproof`** _(`Uint8Array|Buffer`)_: a GrothProof encoded directly as 192 bytes of binary data
* **`spendAuthSig`** _(`Uint8Array|Buffer`)_: a 512-bit signature authorizing this spend

<a name="ZcashSpendDescription_new"></a>
#### Constructor: `ZcashSpendDescription(cv, anchor, nullifier, rk, zkproof, spendAuthSig)`

Instantiate a new `ZcashSpendDescription`.

See the class properties for expanded information on these parameters.

<a name="ZcashSpendDescription_toJSON"></a>
### `ZcashSpendDescription#toJSON()`

Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
useful for simplified inspection.

<a name="ZcashTransaction"></a>
### `class ZcashTransaction`

A class representation of a Zcash Transaction, multiple of which are contained within each [`ZcashBlock`](#ZcashBlock).

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/Transaction')`.

**Properties:**

* **`overwintered`** _(`boolean`)_
* **`version`** _(`number`)_
* **`versionGroupId`** _(`number`)_
* **`vin`** _(`Array.<ZcashTransactionIn>`)_
* **`vout`** _(`Array.<ZcashTransactionIn>`)_
* **`lockTime`** _(`number`)_
* **`expiryHeight`** _(`number|null`)_
* **`valueBalance`** _(`BigInt|null`)_
* **`shieldedSpend`** _(`Array.<ZcashSpendDescription>|null`)_
* **`shieldedOutput`** _(`Array.<ZcashOutputDescription>|null`)_
* **`joinSplitPubKey`** _(`Uint8Array|Buffer|null`)_
* **`joinSplits`** _(`Array.<ZcashJoinSplitDescription>|null`)_
* **`joinSplitSig`** _(`Uint8Array|Buffer|null`)_
* **`bindingSig`** _(`Uint8Array|Buffer|null`)_
* **`hash`** _(`Uint8Array|Buffer`)_

<a name="ZcashTransaction_new"></a>
#### Constructor: `ZcashTransaction()`

Instantiate a new `ZcashTransaction`.

See the class properties for expanded information on these parameters.

<a name="ZcashTransaction_toJSON"></a>
### `ZcashTransaction#toJSON()`

Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
useful for simplified inspection.

<a name="ZcashTransaction_toSerializable"></a>
### `ZcashTransaction#toSerializable()`

Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
useful for simplified inspection.

<a name="ZcashTransactionIn"></a>
### `class ZcashTransactionIn`

A class representation of a Zcash TransactionIn, multiple of which are contained within each [`ZcashTransaction`](#ZcashTransaction).

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/TransactionIn')`.

**Properties:**

* **`prevout`** _(`ZcashOutPoint`)_
* **`scriptSig`** _(`Uint8Array|Buffer`)_: an arbitrary length byte array
* **`sequence`** _(`number`)_

<a name="ZcashTransactionIn_new"></a>
#### Constructor: `ZcashTransactionIn(prevout, scriptSig, sequence)`

Instantiate a new `ZcashTransactionIn`.

See the class properties for expanded information on these parameters.

<a name="ZcashTransactionIn_toJSON"></a>
### `ZcashTransactionIn#toJSON()`

Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
useful for simplified inspection.

The serailizable form converts this object to `{ coinbase: scriptSig, sequence: sequence }` to match the Zcash API output.

<a name="ZcashTransactionOut"></a>
### `class ZcashTransactionOut`

A class representation of a Zcash TransactionOut, multiple of which are contained within each [`ZcashTransaction`](#ZcashTransaction).

This class isn't explicitly exported, access it for direct use with `require('zcash-block/classes/TransactionOut')`.

**Properties:**

* **`value`** _(`BigInt`)_: an amount / value for this TransactionOut
* **`scriptPubKey`** _(`Uint8Array|Buffer`)_: an arbitrary length byte array

<a name="ZcashTransactionOut_new"></a>
#### Constructor: `ZcashTransactionOut(value, scriptPubKey)`

Instantiate a new `ZcashTransactionOut`.

See the class properties for expanded information on these parameters.

<a name="ZcashTransactionOut_toJSON"></a>
### `ZcashTransactionOut#toJSON()`

Convert to a serializable form that has nice stringified hashes and other simplified forms. May be
useful for simplified inspection.

The serialized version includes the raw `value` as `valueZat` while `value` is a proper Zcash coin value.

## License and Copyright

Copyright 2019 Rod Vagg

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
