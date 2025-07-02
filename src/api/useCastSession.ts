import { useEffect, useState } from 'react'
import CastContext from './CastContext'
import CastSession from './CastSession'

export interface UseCastSessionOptions {
  /**
   * Skip updating the session when the app is suspended to background or resumed back.
   *
   * This is primarily targeted at iOS which by default [suspends sessions when backgrounded](https://developers.google.com/cast/docs/reference/ios/interface_g_c_k_cast_options#a0edf44953049a7d888847745a387c9dc). Alternatively, you can set `options.suspendSessionsWhenBackgrounded = false` when initializing the CastContext in `AppDelegate`.
   */
  ignoreSessionUpdatesInBackground?: boolean
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

export default function useCastSession(
  options?: UseCastSessionOptions
): CastSession | null {
  const ignoreBackground = options?.ignoreSessionUpdatesInBackground

  const [castSession, setCastSession] = useState<CastSession | null>(null)

  useEffect(() => {
    // Use the singleton SessionManager from CastContext
    const manager = CastContext.getSessionManager()

    // Force initialization of CastContext first
    CastContext.initialize()
      .then(() => {
        console.log(
          '[GoogleCast] CastContext initialized in useCastSession hook'
        )
        // Initialize session on mount
        return manager.getCurrentCastSession()
      })
      .then((session) => {
        console.log(
          '[GoogleCast] Got initial session in hook:',
          session?.id || 'none'
        )
        setCastSession(session)
      })
      .catch((err) => {
        console.warn('[GoogleCast] Error initializing session in hook:', err)
      })

    const started = manager.onSessionStarted((session) => {
      console.log('[GoogleCast] Session started event in hook:', session.id)
      setCastSession(session)
    })

    const suspended = ignoreBackground
      ? null
      : manager.onSessionSuspended(() => {
          console.log('[GoogleCast] Session suspended event in hook')
          setCastSession(null)
        })

    const resumed = manager.onSessionResumed((session) => {
      console.log('[GoogleCast] Session resumed event in hook:', session.id)
      if (ignoreBackground) {
        // only update the session if it's different from previous one
        setCastSession((s) => (s?.id === session.id ? s : session))
      } else {
        setCastSession(session)
      }
    })

    const ended = manager.onSessionEnded(() => {
      console.log('[GoogleCast] Session ended event in hook')
      setCastSession(null)
    })

    return () => {
      started.remove()
      suspended?.remove()
      resumed?.remove()
      ended.remove()
    }
  }, [ignoreBackground])

  return castSession
}
