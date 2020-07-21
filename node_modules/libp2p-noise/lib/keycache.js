function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Storage for static keys of previously connected peers.
 */
class Keycache {
  constructor() {
    _defineProperty(this, "storage", new Map());
  }

  store(peerId, key) {
    this.storage.set(peerId.id, key);
  }

  load(peerId) {
    if (!peerId) {
      return null;
    }

    return this.storage.get(peerId.id) || null;
  }

  resetStorage() {
    this.storage.clear();
  }

}

const KeyCache = new Keycache();
export { KeyCache };
//# sourceMappingURL=keycache.js.map