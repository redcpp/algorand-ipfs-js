import debug from "debug";
import { DUMP_SESSION_KEYS } from './constants';
export const logger = debug('libp2p:noise');
let keyLogger;

if (DUMP_SESSION_KEYS) {
  keyLogger = logger;
} else {
  keyLogger = () => {
    /* do nothing */
  };
}

export function logLocalStaticKeys(s) {
  keyLogger("LOCAL_STATIC_PUBLIC_KEY ".concat(s.publicKey.toString('hex')));
  keyLogger("LOCAL_STATIC_PRIVATE_KEY ".concat(s.privateKey.toString('hex')));
}
export function logLocalEphemeralKeys(e) {
  if (e) {
    keyLogger("LOCAL_PUBLIC_EPHEMERAL_KEY ".concat(e.publicKey.toString('hex')));
    keyLogger("LOCAL_PRIVATE_EPHEMERAL_KEY ".concat(e.privateKey.toString('hex')));
  } else {
    keyLogger('Missing local ephemeral keys.');
  }
}
export function logRemoteStaticKey(rs) {
  keyLogger("REMOTE_STATIC_PUBLIC_KEY ".concat(rs.toString('hex')));
}
export function logRemoteEphemeralKey(re) {
  keyLogger("REMOTE_EPHEMERAL_PUBLIC_KEY ".concat(re.toString('hex')));
}
export function logCipherState(session) {
  if (session.cs1 && session.cs2) {
    keyLogger("CIPHER_STATE_1 ".concat(session.cs1.n, " ").concat(session.cs1.k.toString('hex')));
    keyLogger("CIPHER_STATE_2 ".concat(session.cs2.n, " ").concat(session.cs2.k.toString('hex')));
  } else {
    keyLogger('Missing cipher state.');
  }
}
//# sourceMappingURL=logger.js.map