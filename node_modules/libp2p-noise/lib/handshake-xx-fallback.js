function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Buffer } from "buffer";
import { XXHandshake } from "./handshake-xx";
import { decodePayload, getPeerIdFromPayload, verifySignedPayload } from "./utils";
import { logger, logLocalEphemeralKeys, logRemoteEphemeralKey, logRemoteStaticKey } from "./logger";
import { decode0, decode1 } from "./encoder";
export class XXFallbackHandshake extends XXHandshake {
  constructor(isInitiator, payload, prologue, staticKeypair, connection, initialMsg, remotePeer, ephemeralKeys, handshake) {
    super(isInitiator, payload, prologue, staticKeypair, connection, remotePeer, handshake);

    _defineProperty(this, "ephemeralKeys", void 0);

    _defineProperty(this, "initialMsg", void 0);

    if (ephemeralKeys) {
      this.ephemeralKeys = ephemeralKeys;
    }

    this.initialMsg = initialMsg;
  } // stage 0


  async propose() {
    if (this.isInitiator) {
      this.xx.sendMessage(this.session, Buffer.alloc(0), this.ephemeralKeys);
      logger("XX Fallback Stage 0 - Initialized state as the first message was sent by initiator.");
      logLocalEphemeralKeys(this.session.hs.e);
    } else {
      logger("XX Fallback Stage 0 - Responder decoding initial msg from IK.");
      const receivedMessageBuffer = decode0(this.initialMsg);
      const {
        valid
      } = this.xx.recvMessage(this.session, {
        ne: receivedMessageBuffer.ne,
        ns: Buffer.alloc(0),
        ciphertext: Buffer.alloc(0)
      });

      if (!valid) {
        throw new Error("xx fallback stage 0 decryption validation fail");
      }

      logger("XX Fallback Stage 0 - Responder used received message from IK.");
      logRemoteEphemeralKey(this.session.hs.re);
    }
  } // stage 1


  async exchange() {
    if (this.isInitiator) {
      const receivedMessageBuffer = decode1(this.initialMsg);
      const {
        plaintext,
        valid
      } = this.xx.recvMessage(this.session, receivedMessageBuffer);

      if (!valid) {
        throw new Error("xx fallback stage 1 decryption validation fail");
      }

      logger('XX Fallback Stage 1 - Initiator used received message from IK.');
      logRemoteEphemeralKey(this.session.hs.re);
      logRemoteStaticKey(this.session.hs.rs);
      logger("Initiator going to check remote's signature...");

      try {
        const decodedPayload = await decodePayload(plaintext);
        this.remotePeer = this.remotePeer || (await getPeerIdFromPayload(decodedPayload));
        await verifySignedPayload(this.session.hs.rs, decodedPayload, this.remotePeer);
        this.setRemoteEarlyData(decodedPayload.data);
      } catch (e) {
        throw new Error("Error occurred while verifying signed payload from responder: ".concat(e.message));
      }

      logger("All good with the signature!");
    } else {
      logger("XX Fallback Stage 1 - Responder start");
      await super.exchange();
      logger("XX Fallback Stage 1 - Responder end");
    }
  }

}
//# sourceMappingURL=handshake-xx-fallback.js.map