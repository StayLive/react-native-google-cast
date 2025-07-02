import { useEffect, useState } from 'react';
import useCastSession from './useCastSession';

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
export default function useCastChannel(namespace, onMessage, useCastSessionOptions) {
  const [castChannel, setCastChannel] = useState(null);
  const castSession = useCastSession(useCastSessionOptions);
  useEffect(() => {
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
  useEffect(() => {
    if (!castChannel || !onMessage) return;
    castChannel.onMessage(onMessage);
    return () => castChannel.offMessage();
  }, [castChannel, onMessage]);
  return castChannel;
}
//# sourceMappingURL=useCastChannel.js.map