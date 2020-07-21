function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

export class FailedIKError extends Error {
  constructor(initialMsg, message) {
    super(message);

    _defineProperty(this, "initialMsg", void 0);

    this.initialMsg = initialMsg;
    this.name = "FailedIKhandshake";
  }

}
;
//# sourceMappingURL=errors.js.map