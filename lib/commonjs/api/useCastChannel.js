"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useCastChannel;
var _react = require("react");
var _useCastSession = _interopRequireDefault(require("./useCastSession"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Hook that establishes a custom {@link CastChannel} on the current connected session.
 *
 * @param namespace custom namespace starting with `urn:x-cast:`
 * @param onMessage listener called when a message from the receiver was received
 * @returns custom channel, or `null` if there's no session connected
 * @example
 * ```js
 * import { useCastChannel } from 'react-native-google-cast'
 *
 * function MyComponent() {
 *   const castChannel = useCastChannel(
 *     'urn:x-cast:com.example.custom',
 *     useCallback(message => { console.log('Received message', message) }, [])
 *   )
 *
 *   // later, for example after pressing a button
 *   function onPress() {
 *     if (castChannel) {
 *       castChannel.sendMessage('...')
 *     }
 *   }
 * }
 * ```
 */
function useCastChannel(namespace, onMessage, useCastSessionOptions) {
  const [castChannel, setCastChannel] = (0, _react.useState)(null);
  const castSession = (0, _useCastSession.default)(useCastSessionOptions);
  (0, _react.useEffect)(() => {
    let channel;
    if (castSession) {
      castSession.addChannel(namespace).then(c => {
        channel = c;
        setCastChannel(c);
      });
    } else {
      channel = null;
      setCastChannel(null);
    }
    return () => {
      var _channel;
      (_channel = channel) === null || _channel === void 0 || _channel.remove();
    };
  }, [castSession, namespace]);
  (0, _react.useEffect)(() => {
    if (!castChannel || !onMessage) return;
    castChannel.onMessage(onMessage);
    return () => castChannel.offMessage();
  }, [castChannel, onMessage]);
  return castChannel;
}
//# sourceMappingURL=useCastChannel.js.map