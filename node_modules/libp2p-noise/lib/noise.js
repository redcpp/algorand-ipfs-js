function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import x25519 from 'bcrypto/lib/js/x25519';
import { Buffer } from "buffer";
import Wrap from 'it-pb-rpc';
import DuplexPair from 'it-pair/duplex';
import ensureBuffer from 'it-buffer';
import pipe from 'it-pipe';
import { encode, decode } from 'it-length-prefixed';
import { XXHandshake } from "./handshake-xx";
import { IKHandshake } from "./handshake-ik";
import { XXFallbackHandshake } from "./handshake-xx-fallback";
import { generateKeypair, getPayload } from "./utils";
import { uint16BEDecode, uint16BEEncode } from "./encoder";
import { decryptStream, encryptStream } from "./crypto";
import { KeyCache } from "./keycache";
import { logger } from "./logger";
import { NOISE_MSG_MAX_LENGTH_BYTES } from "./constants";
export class Noise {
  /**
   *
   * @param staticNoiseKey x25519 private key, reuse for faster handshakes
   * @param earlyData
   */
  constructor(staticNoiseKey, earlyData) {
    _defineProperty(this, "protocol", "/noise");

    _defineProperty(this, "prologue", Buffer.alloc(0));

    _defineProperty(this, "staticKeys", void 0);

    _defineProperty(this, "earlyData", void 0);

    _defineProperty(this, "useNoisePipes", void 0);

    this.earlyData = earlyData || Buffer.alloc(0); //disabled until properly specked

    this.useNoisePipes = false;

    if (staticNoiseKey) {
      const publicKey = x25519.publicKeyCreate(staticNoiseKey);
      this.staticKeys = {
        privateKey: staticNoiseKey,
        publicKey
      };
    } else {
      this.staticKeys = generateKeypair();
    }
  }
  /**
   * Encrypt outgoing data to the remote party (handshake as initiator)
   * @param {PeerId} localPeer - PeerId of the receiving peer
   * @param connection - streaming iterable duplex that will be encrypted
   * @param {PeerId} remotePeer - PeerId of the remote peer. Used to validate the integrity of the remote peer.
   * @returns {Promise<SecureOutbound>}
   */


  async secureOutbound(localPeer, connection, remotePeer) {
    const wrappedConnection = Wrap(connection, {
      lengthEncoder: uint16BEEncode,
      lengthDecoder: uint16BEDecode,
      maxDataLength: NOISE_MSG_MAX_LENGTH_BYTES
    });
    const handshake = await this.performHandshake({
      connection: wrappedConnection,
      isInitiator: true,
      localPeer,
      remotePeer
    });
    const conn = await this.createSecureConnection(wrappedConnection, handshake);
    return {
      conn,
      remoteEarlyData: handshake.remoteEarlyData,
      remotePeer: handshake.remotePeer
    };
  }
  /**
   * Decrypt incoming data (handshake as responder).
   * @param {PeerId} localPeer - PeerId of the receiving peer.
   * @param connection - streaming iterable duplex that will be encryption.
   * @param {PeerId} remotePeer - optional PeerId of the initiating peer, if known. This may only exist during transport upgrades.
   * @returns {Promise<SecureOutbound>}
   */


  async secureInbound(localPeer, connection, remotePeer) {
    const wrappedConnection = Wrap(connection, {
      lengthEncoder: uint16BEEncode,
      lengthDecoder: uint16BEDecode,
      maxDataLength: NOISE_MSG_MAX_LENGTH_BYTES
    });
    const handshake = await this.performHandshake({
      connection: wrappedConnection,
      isInitiator: false,
      localPeer,
      remotePeer
    });
    const conn = await this.createSecureConnection(wrappedConnection, handshake);
    return {
      conn,
      remoteEarlyData: handshake.remoteEarlyData,
      remotePeer: handshake.remotePeer
    };
  }
  /**
   * If Noise pipes supported, tries IK handshake first with XX as fallback if it fails.
   * If noise pipes disabled or remote peer static key is unknown, use XX.
   * @param params
   */


  async performHandshake(params) {
    const payload = await getPayload(params.localPeer, this.staticKeys.publicKey, this.earlyData);
    let tryIK = this.useNoisePipes;

    if (params.isInitiator && KeyCache.load(params.remotePeer) === null) {
      //if we are initiator and remote static key is unknown, don't try IK
      tryIK = false;
    } // Try IK if acting as responder or initiator that has remote's static key.


    if (tryIK) {
      // Try IK first
      const {
        remotePeer,
        connection,
        isInitiator
      } = params;
      const ikHandshake = new IKHandshake(isInitiator, payload, this.prologue, this.staticKeys, connection, //safe to cast as we did checks
      KeyCache.load(params.remotePeer) || Buffer.alloc(32), remotePeer);

      try {
        return await this.performIKHandshake(ikHandshake);
      } catch (e) {
        // IK failed, go to XX fallback
        let ephemeralKeys;

        if (params.isInitiator) {
          ephemeralKeys = ikHandshake.getLocalEphemeralKeys();
        }

        return await this.performXXFallbackHandshake(params, payload, e.initialMsg, ephemeralKeys);
      }
    } else {
      // run XX handshake
      return await this.performXXHandshake(params, payload);
    }
  }

  async performXXFallbackHandshake(params, payload, initialMsg, ephemeralKeys) {
    const {
      isInitiator,
      remotePeer,
      connection
    } = params;
    const handshake = new XXFallbackHandshake(isInitiator, payload, this.prologue, this.staticKeys, connection, initialMsg, remotePeer, ephemeralKeys);

    try {
      await handshake.propose();
      await handshake.exchange();
      await handshake.finish();
    } catch (e) {
      logger(e);
      throw new Error("Error occurred during XX Fallback handshake: ".concat(e.message));
    }

    return handshake;
  }

  async performXXHandshake(params, payload) {
    const {
      isInitiator,
      remotePeer,
      connection
    } = params;
    const handshake = new XXHandshake(isInitiator, payload, this.prologue, this.staticKeys, connection, remotePeer);

    try {
      await handshake.propose();
      await handshake.exchange();
      await handshake.finish();

      if (this.useNoisePipes && handshake.remotePeer) {
        KeyCache.store(handshake.remotePeer, handshake.getRemoteStaticKey());
      }
    } catch (e) {
      throw new Error("Error occurred during XX handshake: ".concat(e.message));
    }

    return handshake;
  }

  async performIKHandshake(handshake) {
    await handshake.stage0();
    await handshake.stage1();
    return handshake;
  }

  async createSecureConnection(connection, handshake) {
    // Create encryption box/unbox wrapper
    const [secure, user] = DuplexPair();
    const network = connection.unwrap();
    pipe(secure, // write to wrapper
    ensureBuffer, // ensure any type of data is converted to buffer
    encryptStream(handshake), // data is encrypted
    encode({
      lengthEncoder: uint16BEEncode
    }), // prefix with message length
    network, // send to the remote peer
    decode({
      lengthDecoder: uint16BEDecode
    }), // read message length prefix
    ensureBuffer, // ensure any type of data is converted to buffer
    decryptStream(handshake), // decrypt the incoming data
    secure // pipe to the wrapper
    );
    return user;
  }

}
//# sourceMappingURL=noise.js.map