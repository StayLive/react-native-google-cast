import CastContext from '../api/CastContext'

/**
 * Helper function to completely reset the Cast SDK state when having issues.
 * This is particularly useful for iOS 18.5 where the Cast SDK might get into a bad state.
 *
 * @returns Promise that resolves when the reset is complete
 */
export async function resetCastSDK(): Promise<void> {
  console.log('[GoogleCast] Starting complete Cast SDK reset')

  try {
    // First reset the context
    await CastContext.resetContext()

    // Then get the current session (if any) and try to refresh it
    const session =
      await CastContext.getSessionManager().getCurrentCastSession()

    if (session) {
      console.log('[GoogleCast] Refreshing active session after reset')
      await session.refreshClient()
    } else {
      console.log('[GoogleCast] No active session to refresh after reset')
    }

    console.log('[GoogleCast] Cast SDK reset completed successfully')
  } catch (error) {
    console.warn('[GoogleCast] Error during Cast SDK reset:', error)
    throw error
  }
}

export default resetCastSDK
