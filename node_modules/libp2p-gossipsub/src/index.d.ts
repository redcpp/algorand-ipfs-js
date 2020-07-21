import { MessageCache } from './messageCache';
import { RPC, Message, InMessage, ControlMessage, ControlIHave, ControlGraft, ControlIWant, ControlPrune } from './message';
import { Peer, Registrar } from './peer';
import PeerId = require('peer-id');
import BasicPubsub = require('./pubsub');
interface GossipOptions {
    emitSelf: boolean;
    gossipIncoming: boolean;
    fallbackToFloodsub: boolean;
    msgIdFn: (msg: Message) => string;
    messageCache: MessageCache;
}
declare class Gossipsub extends BasicPubsub {
    peers: Map<string, Peer>;
    topics: Map<string, Set<Peer>>;
    mesh: Map<string, Set<Peer>>;
    fanout: Map<string, Set<Peer>>;
    lastpub: Map<string, number>;
    gossip: Map<Peer, ControlIHave[]>;
    control: Map<Peer, ControlMessage>;
    _options: GossipOptions;
    static multicodec: string;
    /**
     * @param {PeerId} peerId instance of the peer's PeerId
     * @param {Object} registrar
     * @param {function} registrar.handle
     * @param {function} registrar.register
     * @param {function} registrar.unregister
     * @param {Object} [options]
     * @param {bool} [options.emitSelf] if publish should emit to self, if subscribed, defaults to false
     * @param {bool} [options.gossipIncoming] if incoming messages on a subscribed topic should be automatically gossiped, defaults to true
     * @param {bool} [options.fallbackToFloodsub] if dial should fallback to floodsub, defaults to true
     * @param {function} [options.msgIdFn] override the default message id function
     * @param {Object} [options.messageCache] override the default MessageCache
     * @constructor
     */
    constructor(peerId: PeerId, registrar: Registrar, options?: Partial<GossipOptions>);
    /**
     * Removes a peer from the router
     * @override
     * @param {Peer} peer
     * @returns {Peer}
     */
    _removePeer(peer: Peer): Peer;
    /**
     * Handles an rpc request from a peer
     *
     * @override
     * @param {String} idB58Str
     * @param {Peer} peer
     * @param {RPC} rpc
     * @returns {void}
     */
    _processRpc(idB58Str: string, peer: Peer, rpc: RPC): void;
    /**
     * Handles an rpc control message from a peer
     * @param {Peer} peer
     * @param {ControlMessage} controlMsg
     * @returns {void}
     */
    _processRpcControlMessage(peer: Peer, controlMsg: ControlMessage): void;
    /**
     * Process incoming message,
     * emitting locally and forwarding on to relevant floodsub and gossipsub peers
     * @override
     * @param {Peer} peer
     * @param {Message} msg
     */
    _processRpcMessage(peer: Peer, msg: InMessage): void;
    /**
     * Handles IHAVE messages
     * @param {Peer} peer
     * @param {Array<ControlIHave>} ihave
     * @returns {ControlIWant}
     */
    _handleIHave(peer: Peer, ihave: ControlIHave[]): ControlIWant | undefined;
    /**
     * Handles IWANT messages
     * Returns messages to send back to peer
     * @param {Peer} peer
     * @param {Array<ControlIWant>} iwant
     * @returns {Array<Message>}
     */
    _handleIWant(peer: Peer, iwant: ControlIWant[]): Message[] | undefined;
    /**
     * Handles Graft messages
     * @param {Peer} peer
     * @param {Array<ControlGraft>} graft
     * @return {Array<ControlPrune>}
     */
    _handleGraft(peer: Peer, graft: ControlGraft[]): ControlPrune[] | undefined;
    /**
     * Handles Prune messages
     * @param {Peer} peer
     * @param {Array<ControlPrune>} prune
     * @returns {void}
     */
    _handlePrune(peer: Peer, prune: ControlPrune[]): void;
    /**
     * Mounts the gossipsub protocol onto the libp2p node and sends our
     * our subscriptions to every peer connected
     * @override
     * @returns {Promise}
     */
    start(): Promise<void>;
    /**
     * Unmounts the gossipsub protocol and shuts down every connection
     * @override
     * @returns {Promise}
     */
    stop(): Promise<void>;
    /**
     * Subscribes to topics
     *
     * @override
     * @param {Array<string>} topics
     * @returns {void}
     */
    _subscribe(topics: string[]): void;
    /**
     * Unsubscribes to topics
     *
     * @override
     * @param {Array<string>} topics
     * @returns {void}
     */
    _unsubscribe(topics: string[]): void;
    /**
     * Join topics
     * @param {Array<string>|string} topics
     * @returns {void}
     */
    join(topics: string[] | string): void;
    /**
     * Leave topics
     * @param {Array<string>|string} topics
     * @returns {void}
     */
    leave(topics: string[] | string): void;
    /**
     * Override the default implementation in BasicPubSub.
     * If we don't provide msgIdFn in constructor option, it's the same.
     * @override
     * @param {Message} msg the message object
     * @returns {string} message id as string
     */
    getMsgId(msg: InMessage): string;
    /**
     * Publish messages
     *
     * Note: this function assumes all messages are well-formed RPC objects
     * @override
     * @param {Array<Message>} msgs
     * @returns {void}
     */
    _publish(msgs: InMessage[]): void;
    /**
     * Sends a GRAFT message to a peer
     * @param {Peer} peer
     * @param {String} topic
     * @returns {void}
     */
    _sendGraft(peer: Peer, topic: string): void;
    /**
     * Sends a PRUNE message to a peer
     * @param {Peer} peer
     * @param {String} topic
     * @returns {void}
     */
    _sendPrune(peer: Peer, topic: string): void;
    _sendRpc(peer: Peer, outRpc: RPC): void;
    _piggybackControl(peer: Peer, outRpc: RPC, ctrl: ControlMessage): void;
    _piggybackGossip(peer: Peer, outRpc: RPC, ihave: ControlIHave[]): void;
    /**
     * Send graft and prune messages
     * @param {Map<Peer, Array<String>>} tograft
     * @param {Map<Peer, Array<String>>} toprune
     */
    _sendGraftPrune(tograft: Map<Peer, string[]>, toprune: Map<Peer, string[]>): void;
    /**
     * Emits gossip to peers in a particular topic
     * @param {String} topic
     * @param {Set<Peer>} peers - peers to exclude
     * @returns {void}
     */
    _emitGossip(topic: string, peers: Set<Peer>): void;
    /**
     * Flush gossip and control messages
     */
    _flush(): void;
    /**
     * Adds new IHAVE messages to pending gossip
     * @param {Peer} peer
     * @param {Array<ControlIHave>} controlIHaveMsgs
     * @returns {void}
     */
    _pushGossip(peer: Peer, controlIHaveMsgs: ControlIHave): void;
    /**
     * Returns the current time in milliseconds
     * @returns {number}
     */
    _now(): number;
}
export = Gossipsub;
