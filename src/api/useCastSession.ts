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

    // First ensure CastContext is initialized
    CastContext.initialize().catch((err) => {
      console.warn(
        '[GoogleCast] Error initializing CastContext in useCastSession:',
        err
      )
    })

    // Initialize session on mount with retry logic
    let retryCount = 0
    const maxRetries = 5
    const retryDelay = 1000 // 1 second

    const fetchSession = () => {
      console.log(
        `[GoogleCast] Fetching cast session (attempt ${retryCount + 1}/${maxRetries})`
      )

      manager
        .getCurrentCastSession()
        .then((session) => {
          if (session) {
            console.log(
              '[GoogleCast] Session found in useCastSession:',
              session.id
            )
            setCastSession(session)
          } else if (retryCount < maxRetries) {
            console.log('[GoogleCast] No session found, retrying...')
            retryCount++
            setTimeout(fetchSession, retryDelay * retryCount)
          } else {
            console.log('[GoogleCast] Max retries reached, no session found')
          }
        })
        .catch((err) => {
          console.warn('[GoogleCast] Error getting session:', err)
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(fetchSession, retryDelay * retryCount)
          }
        })
    }

    fetchSession()

    const started = manager.onSessionStarted((session) => {
      console.log(
        '[GoogleCast] Session started event in useCastSession:',
        session.id
      )
      setCastSession(session)
    })

    const suspended = ignoreBackground
      ? null
      : manager.onSessionSuspended(() => {
          console.log('[GoogleCast] Session suspended in useCastSession')
          setCastSession(null)
        })

    const resumed = manager.onSessionResumed((session) => {
      console.log('[GoogleCast] Session resumed in useCastSession:', session.id)
      if (ignoreBackground) {
        // only update the session if it's different from previous one
        setCastSession((s) => (s?.id === session.id ? s : session))
      } else {
        setCastSession(session)
      }
    })

    const ended = manager.onSessionEnded(() => {
      console.log('[GoogleCast] Session ended in useCastSession')
      setCastSession(null)
    })

    // Setup a polling interval to check for session updates
    // This helps with iOS 18.5 where events might not fire correctly
    const pollingInterval = setInterval(() => {
      // Only poll if we don't have a session yet
      if (!castSession) {
        console.log('[GoogleCast] Polling for session updates')
        manager
          .getCurrentCastSession()
          .then((session) => {
            if (session) {
              console.log('[GoogleCast] Session found via polling:', session.id)
              setCastSession(session)
            }
          })
          .catch((err) => {
            console.warn('[GoogleCast] Error polling for session:', err)
          })
      }
    }, 5000) // Check every 5 seconds

    return () => {
      console.log('[GoogleCast] Cleaning up useCastSession listeners')
      started.remove()
      suspended?.remove()
      resumed?.remove()
      ended.remove()
      clearInterval(pollingInterval)
    }
  }, [ignoreBackground, castSession])

  return castSession
}
