import { Buffer } from "buffer";
import AEAD from 'bcrypto/lib/js/aead';
import x25519 from 'bcrypto/lib/js/x25519';
import SHA256 from 'bcrypto/lib/js/sha256';
import { getHkdf } from "../utils";
import { logger } from "../logger";
export const MIN_NONCE = 0;
export class AbstractHandshake {
  encryptWithAd(cs, ad, plaintext) {
    const e = this.encrypt(cs.k, cs.n, ad, plaintext);
    this.setNonce(cs, this.incrementNonce(cs.n));
    return e;
  }

  decryptWithAd(cs, ad, ciphertext) {
    const {
      plaintext,
      valid
    } = this.decrypt(cs.k, cs.n, ad, ciphertext);
    this.setNonce(cs, this.incrementNonce(cs.n));
    return {
      plaintext,
      valid
    };
  } // Cipher state related


  hasKey(cs) {
    return !this.isEmptyKey(cs.k);
  }

  setNonce(cs, nonce) {
    cs.n = nonce;
  }

  createEmptyKey() {
    return Buffer.alloc(32);
  }

  isEmptyKey(k) {
    const emptyKey = this.createEmptyKey();
    return emptyKey.equals(k);
  }

  incrementNonce(n) {
    return n + 1;
  }

  nonceToBytes(n) {
    const nonce = Buffer.alloc(12);
    nonce.writeUInt32LE(n, 4);
    return nonce;
  }

  encrypt(k, n, ad, plaintext) {
    const nonce = this.nonceToBytes(n);
    const ctx = new AEAD();
    plaintext = Buffer.from(plaintext);
    ctx.init(k, nonce);
    ctx.aad(ad);
    ctx.encrypt(plaintext); // Encryption is done on the sent reference

    return Buffer.concat([plaintext, ctx.final()]);
  }

  encryptAndHash(ss, plaintext) {
    let ciphertext;

    if (this.hasKey(ss.cs)) {
      ciphertext = this.encryptWithAd(ss.cs, ss.h, plaintext);
    } else {
      ciphertext = plaintext;
    }

    this.mixHash(ss, ciphertext);
    return ciphertext;
  }

  decrypt(k, n, ad, ciphertext) {
    const nonce = this.nonceToBytes(n);
    const ctx = new AEAD();
    ciphertext = Buffer.from(ciphertext);
    const tag = ciphertext.slice(ciphertext.length - 16);
    ciphertext = ciphertext.slice(0, ciphertext.length - 16);
    ctx.init(k, nonce);
    ctx.aad(ad);
    ctx.decrypt(ciphertext); // Decryption is done on the sent reference

    return {
      plaintext: ciphertext,
      valid: ctx.verify(tag)
    };
  }

  decryptAndHash(ss, ciphertext) {
    let plaintext,
        valid = true;

    if (this.hasKey(ss.cs)) {
      ({
        plaintext,
        valid
      } = this.decryptWithAd(ss.cs, ss.h, ciphertext));
    } else {
      plaintext = ciphertext;
    }

    this.mixHash(ss, ciphertext);
    return {
      plaintext,
      valid
    };
  }

  dh(privateKey, publicKey) {
    try {
      const derived = x25519.derive(publicKey, privateKey);
      const result = Buffer.alloc(32);
      derived.copy(result);
      return result;
    } catch (e) {
      logger(e.message);
      return Buffer.alloc(32);
    }
  }

  mixHash(ss, data) {
    ss.h = this.getHash(ss.h, data);
  }

  getHash(a, b) {
    return SHA256.digest(Buffer.from([...a, ...b]));
  }

  mixKey(ss, ikm) {
    const [ck, tempK] = getHkdf(ss.ck, ikm);
    ss.cs = this.initializeKey(tempK);
    ss.ck = ck;
  }

  initializeKey(k) {
    const n = MIN_NONCE;
    return {
      k,
      n
    };
  } // Symmetric state related


  initializeSymmetric(protocolName) {
    const protocolNameBytes = Buffer.from(protocolName, 'utf-8');
    const h = this.hashProtocolName(protocolNameBytes);
    const ck = h;
    const key = this.createEmptyKey();
    const cs = this.initializeKey(key);
    return {
      cs,
      ck,
      h
    };
  }

  hashProtocolName(protocolName) {
    if (protocolName.length <= 32) {
      const h = Buffer.alloc(32);
      protocolName.copy(h);
      return h;
    } else {
      return this.getHash(protocolName, Buffer.alloc(0));
    }
  }

  split(ss) {
    const [tempk1, tempk2] = getHkdf(ss.ck, Buffer.alloc(0));
    const cs1 = this.initializeKey(tempk1);
    const cs2 = this.initializeKey(tempk2);
    return {
      cs1,
      cs2
    };
  }

  writeMessageRegular(cs, payload) {
    const ciphertext = this.encryptWithAd(cs, Buffer.alloc(0), payload);
    const ne = this.createEmptyKey();
    const ns = Buffer.alloc(0);
    return {
      ne,
      ns,
      ciphertext
    };
  }

  readMessageRegular(cs, message) {
    return this.decryptWithAd(cs, Buffer.alloc(0), message.ciphertext);
  }

}
//# sourceMappingURL=abstract-handshake.js.map