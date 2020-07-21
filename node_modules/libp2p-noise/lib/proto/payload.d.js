function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** Namespace pb. */
export let pb;

(function (_pb) {
  /** Properties of a NoiseHandshakePayload. */

  /** Represents a NoiseHandshakePayload. */
  class NoiseHandshakePayload {
    constructor() {
      _defineProperty(this, "identityKey", void 0);

      _defineProperty(this, "identitySig", void 0);

      _defineProperty(this, "data", void 0);
    }

  }
})(pb || (pb = {}));
//# sourceMappingURL=payload.d.js.map