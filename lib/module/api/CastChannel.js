function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { NativeEventEmitter, NativeModules } from 'react-native';
const {
  RNGCCastSession: Native
} = NativeModules;

/**
 * A channel for sending custom messages between this sender and the Cast receiver. Use when you've built a custom receiver and want to communicate with it.
 *
 * @see [Custom Channels](../../guides/custom-channels)
 *
 * @example
 * ```js
 * import { CastChannel } from 'react-native-google-cast'
 *
 * const channel = await castSession.addChannel('urn:x-cast:com.example.custom')
 *
 * channel.sendMessage('...')
 * ```
 */
export default class CastChannel {
  constructor(data, onMessage) {
    _defineProperty(this, "channelListener", void 0);
    _defineProperty(this, "messageListener", void 0);
    /** A flag indicating whether this channel is currently connected. */
    _defineProperty(this, "connected", void 0);
    /** A custom channel identifier starting with `urn:x-cast:`. */
    _defineProperty(this, "namespace", void 0);
    /** A flag indicating whether this channel is currently writable. */
    _defineProperty(this, "writable", void 0);
    this.connected = data.connected;
    this.namespace = data.namespace;
    this.writable = data.writable;
    if (onMessage) this.onMessage(onMessage);
    this.onUpdate();
  }

  /**
   * Add a custom channel to a connected session. This method is equivalent to {@link CastSession#addChannel}.
   *
   * @param namespace A custom channel identifier starting with `urn:x-cast:`, for example `urn:x-cast:com.reactnative.googlecast.example`. The namespace name is arbitrary; just make sure it's unique.
   * @param onMessage function to be invoked when we receive a message from the connected Cast receiver.
   */
  static async add(namespace, onMessage) {
    if (namespace === 'urn:x-cast:com.google.cast.media') throw new Error('The namespace "urn:x-cast:com.google.cast.media" is reserved. Please use a different name.');
    const channel = await Native.addChannel(namespace);
    if (!channel.connected) {
      console.warn(`Channel ${namespace} not connected. Make sure a session is established and you've set a listener in your custom receiver https://developers.google.com/cast/docs/web_receiver/core_features#custom_messages`);
    }
    return new CastChannel(channel, onMessage);
  }

  /**
   * Register a message listener. If one already exists, it will be replaced.
   *
   * @param listener function to be invoked when we receive a message from the connected Cast receiver.
   */
  onMessage(listener) {
    this.offMessage();
    const eventEmitter = new NativeEventEmitter(Native);
    this.messageListener = eventEmitter.addListener(Native.CHANNEL_MESSAGE_RECEIVED, ({
      namespace,
      message
    }) => {
      this.namespace === namespace && listener(message);
    });
  }

  /**
   * Unregister a message listener.
   */
  offMessage() {
    var _this$messageListener;
    (_this$messageListener = this.messageListener) === null || _this$messageListener === void 0 || _this$messageListener.remove();
    this.messageListener = undefined;
  }
  onUpdate() {
    const eventEmitter = new NativeEventEmitter(Native);
    this.channelListener = eventEmitter.addListener(Native.CHANNEL_UPDATED, ch => {
      if (this.namespace !== ch.namespace) return;
      this.connected = ch.connected;
      this.writable = ch.writable;
    });
  }
  offUpdate() {
    var _this$channelListener;
    (_this$channelListener = this.channelListener) === null || _this$channelListener === void 0 || _this$channelListener.remove();
    this.channelListener = undefined;
  }

  /**
   * Remove the channel when it's no longer needed.
   * By calling this method, the underlying channel will be destroyed.
   */
  remove() {
    this.offMessage();
    this.offUpdate();
    return Native.removeChannel(this.namespace);
  }

  /**
   * Send a message to the connected Cast receiver using this channel. Note that by default you need to send the message as a JSON object, unless you've initialized the namespace on the receiver to be of the string type.
   *
   * To listen for responses, register an {#onMessage} listener.
   */
  sendMessage(message) {
    return Native.sendMessage(this.namespace, typeof message === 'string' ? message : JSON.stringify(message));
  }
}
//# sourceMappingURL=CastChannel.js.map