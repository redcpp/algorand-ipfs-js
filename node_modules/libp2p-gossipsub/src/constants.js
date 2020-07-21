'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.GossipsubFanoutTTL = exports.GossipsubHeartbeatInterval = exports.GossipsubHeartbeatInitialDelay = exports.GossipsubHistoryGossip = exports.GossipsubHistoryLength = exports.GossipsubDhi = exports.GossipsubDlo = exports.GossipsubD = exports.GossipsubID = exports.FloodSubID = void 0;
const second = exports.second = 1000;
const minute = exports.minute = 60 * second;
// Protocol identifiers
exports.FloodSubID = '/floodsub/1.0.0';
exports.GossipsubID = '/meshsub/1.0.0';
// Overlay parameters
exports.GossipsubD = 6;
exports.GossipsubDlo = 4;
exports.GossipsubDhi = 12;
// Gossip parameters
exports.GossipsubHistoryLength = 5;
exports.GossipsubHistoryGossip = 3;
// Heartbeat interval
exports.GossipsubHeartbeatInitialDelay = 100 / second;
exports.GossipsubHeartbeatInterval = second;
// Fanout ttl
exports.GossipsubFanoutTTL = minute;
