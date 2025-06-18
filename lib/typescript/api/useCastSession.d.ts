import CastSession from './CastSession';
export interface UseCastSessionOptions {
    /**
     * Skip updating the session when the app is suspended to background or resumed back.
     *
     * This is primarily targeted at iOS which by default [suspends sessions when backgrounded](https://developers.google.com/cast/docs/reference/ios/interface_g_c_k_cast_options#a0edf44953049a7d888847745a387c9dc). Alternatively, you can set `options.suspendSessionsWhenBackgrounded = false` when initializing the CastContext in `AppDelegate`.
     */
    ignoreSessionUpdatesInBackground?: boolean;
}
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
export default function useCastSession(options?: UseCastSessionOptions): CastSession | null;
