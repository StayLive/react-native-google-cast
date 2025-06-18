import { useEffect, useState } from 'react';
import SessionManager from './SessionManager';
/**
 * Hook that provides the current {@link CastSession}.
 *
 * @returns current session, or `null` if there's no session connected
 * @example
 * ```js
 * import { useCastSession } from 'react-native-google-cast'
 *
 * function MyComponent() {
 *   const castSession = useCastSession()
 *
 *   if (castSession) {
 *     castSession.client.loadMedia(...)
 *   }
 * }
 * ```
 */

export default function useCastSession(options) {
  const ignoreBackground = options === null || options === void 0 ? void 0 : options.ignoreSessionUpdatesInBackground;
  const [castSession, setCastSession] = useState(null);
  useEffect(() => {
    manager.getCurrentCastSession().then(setCastSession);
    const started = manager.onSessionStarted(setCastSession);
    const suspended = ignoreBackground ? null : manager.onSessionSuspended(() => setCastSession(null));
    const resumed = manager.onSessionResumed(session => {
      if (ignoreBackground) {
        // only update the session if it's different from previous one
        setCastSession(s => (s === null || s === void 0 ? void 0 : s.id) === session.id ? s : session);
      } else {
        setCastSession(session);
      }
    });
    const ended = manager.onSessionEnded(() => setCastSession(null));
    return () => {
      started.remove();
      suspended === null || suspended === void 0 || suspended.remove();
      resumed === null || resumed === void 0 || resumed.remove();
      ended.remove();
    };
  }, [ignoreBackground]);
  return castSession;
}
const manager = new SessionManager();
//# sourceMappingURL=useCastSession.js.map