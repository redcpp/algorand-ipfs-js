import HKDF from 'bcrypto/lib/hkdf';
import x25519 from 'bcrypto/lib/js/x25519';
import SHA256 from 'bcrypto/lib/js/sha256';
import { Buffer } from "buffer";
import PeerId from "peer-id";
import { keys } from 'libp2p-crypto';
import { pb } from "./proto/payload";
const NoiseHandshakePayloadProto = pb.NoiseHandshakePayload;
export function generateKeypair() {
  const privateKey = x25519.privateKeyGenerate();
  const publicKey = x25519.publicKeyCreate(privateKey);
  return {
    publicKey,
    privateKey
  };
}
export async function getPayload(localPeer, staticPublicKey, earlyData) {
  const signedPayload = await signPayload(localPeer, getHandshakePayload(staticPublicKey));
  const earlyDataPayload = earlyData || Buffer.alloc(0);
  return await createHandshakePayload(localPeer.marshalPubKey(), signedPayload, earlyDataPayload);
}
export async function createHandshakePayload(libp2pPublicKey, signedPayload, earlyData) {
  const payloadInit = NoiseHandshakePayloadProto.create({
    identityKey: libp2pPublicKey,
    identitySig: signedPayload,
    data: earlyData || null
  });
  return Buffer.from(NoiseHandshakePayloadProto.encode(payloadInit).finish());
}
export async function signPayload(peerId, payload) {
  return peerId.privKey.sign(payload);
}
export async function getPeerIdFromPayload(payload) {
  return await PeerId.createFromPubKey(Buffer.from(payload.identityKey));
}
export async function decodePayload(payload) {
  return NoiseHandshakePayloadProto.toObject(NoiseHandshakePayloadProto.decode(Buffer.from(payload)));
}
export function getHandshakePayload(publicKey) {
  return Buffer.concat([Buffer.from("noise-libp2p-static-key:"), publicKey]);
}

async function isValidPeerId(peerId, publicKeyProtobuf) {
  const generatedPeerId = await PeerId.createFromPubKey(publicKeyProtobuf);
  return generatedPeerId.id.equals(peerId);
}
/**
 * Verifies signed payload, throws on any irregularities.
 * @param {bytes} noiseStaticKey - owner's noise static key
 * @param {bytes} payload - decoded payload
 * @param {PeerId} remotePeer - owner's libp2p peer ID
 * @returns {Promise<PeerId>} - peer ID of payload owner
 */


export async function verifySignedPayload(noiseStaticKey, payload, remotePeer) {
  const identityKey = Buffer.from(payload.identityKey);

  if (!(await isValidPeerId(remotePeer.id, identityKey))) {
    throw new Error("Peer ID doesn't match libp2p public key.");
  }

  const generatedPayload = getHandshakePayload(noiseStaticKey); // Unmarshaling from PublicKey protobuf

  const publicKey = keys.unmarshalPublicKey(identityKey);

  if (!payload.identitySig || !publicKey.verify(generatedPayload, Buffer.from(payload.identitySig))) {
    throw new Error("Static key doesn't match to peer that signed payload!");
  }

  return PeerId.createFromPubKey(identityKey);
}
export function getHkdf(ck, ikm) {
  const info = Buffer.alloc(0);
  const prk = HKDF.extract(SHA256, ikm, ck);
  const okm = HKDF.expand(SHA256, prk, info, 96);
  const k1 = okm.slice(0, 32);
  const k2 = okm.slice(32, 64);
  const k3 = okm.slice(64, 96);
  return [k1, k2, k3];
}
export function isValidPublicKey(pk) {
  return x25519.publicKeyVerify(pk.slice(0, 32));
}
//# sourceMappingURL=utils.js.map