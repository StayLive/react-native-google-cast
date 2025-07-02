function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { NativeEventEmitter, NativeModules } from 'react-native';
import DiscoveryManager from './DiscoveryManager';
import SessionManager from './SessionManager';
const {
  RNGCCastContext: Native
} = NativeModules;

// Flag to track if we've performed initialization
let isInitialized = false;
// Flag to track if initialization is in progress
let isInitializing = false;
// Promise for ongoing initialization
let initializationPromise = null;

/**
 * A root class containing global objects and state for the Cast SDK. It is the default export of this library.
 *
 * @example
 * ```js
 * import GoogleCast, { CastContext } from 'react-native-google-cast'
 * // GoogleCast and CastContext are equivalent
 * ```
 *
 * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/cast/framework/CastContext) | [iOS](https://developers.google.com/cast/docs/reference/ios/interface_g_c_k_cast_context) | [Chrome](https://developers.google.com/cast/docs/reference/chrome/cast.framework.CastContext)
 */
export default class CastContext {
  /** The current casting state for the application. */
  static getCastState() {
    return Native.getCastState();
  }

  /**
   * Initialize the Google Cast SDK to ensure everything is ready
   * This is called automatically when accessing managers
   */
  static initialize() {
    if (isInitialized) {
      return Promise.resolve();
    }
    if (isInitializing && initializationPromise) {
      return initializationPromise;
    }
    isInitializing = true;
    console.log('[GoogleCast] Starting initialization');
    initializationPromise = new Promise(resolveInit => {
      // First, check if the Cast SDK is available
      Native.getCastState().then(state => {
        console.log('[GoogleCast] Cast state during initialization:', state);

        // Now start discovery to ensure the Cast SDK is fully initialized
        return this.discoveryManager.startDiscovery();
      }).then(() => {
        console.log('[GoogleCast] Discovery started');

        // Give a small delay to allow the SDK to initialize fully
        return new Promise(resolveDelay => setTimeout(resolveDelay, 500));
      }).then(() => {
        // Try to get a session if available to fully initialize
        return this.sessionManager.getCurrentCastSession().catch(() => null); // Ignore errors here
      }).then(() => {
        console.log('[GoogleCast] Initialization completed successfully');
        isInitialized = true;
        isInitializing = false;
        resolveInit();
      }).catch(error => {
        console.warn('[GoogleCast] Initialization failed:', error);
        isInitializing = false;
        // Even if initialization fails, mark as initialized to avoid repeated failures
        isInitialized = true;
        resolveInit(); // Resolve anyway to allow the app to continue
      });
    });
    return initializationPromise;
  }

  /**
   * Force a complete reset of the Cast context and all managers.
   * Use this as a last resort if the Cast functionality isn't working properly.
   */
  static resetContext() {
    console.log('[GoogleCast] Performing full context reset');

    // Reset initialization flags
    isInitialized = false;
    isInitializing = false;
    initializationPromise = null;

    // Try to stop discovery first
    return this.discoveryManager.stopDiscovery().catch(() => {
      // Ignore errors here
    }).then(() => {
      // Try to end any existing session
      return this.sessionManager.endCurrentSession(true).catch(() => {
        // Ignore errors here
      });
    }).then(() => {
      console.log('[GoogleCast] Starting fresh initialization after reset');
      // Start a fresh initialization
      return this.initialize();
    });
  }

  /**
   * (Android only) Verifies that Google Play services is installed and enabled on this device, and that the version installed on this device is no older than the one required by this client. Can be used to determine if the Cast framework is available.
   *
   * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/common/GoogleApiAvailability#isGooglePlayServicesAvailable(android.content.Context))
   */
  static getPlayServicesState() {
    return Native.getPlayServicesState();
  }

  /**
   * Get the DiscoveryManager to manage device discovery.
   */
  static getDiscoveryManager() {
    // Initialize the Cast SDK first
    this.initialize().catch(err => {
      console.warn('[GoogleCast] Failed to initialize during getDiscoveryManager:', err);
    });
    return this.discoveryManager;
  }

  /**
   * Get the SessionManager to manage cast sessions.
   */
  static getSessionManager() {
    // Initialize the Cast SDK first
    this.initialize().catch(err => {
      console.warn('[GoogleCast] Failed to initialize during getSessionManager:', err);
    });
    return this.sessionManager;
  }

  /**
   * Displays the Cast Dialog programmatically. Users can also open the Cast Dialog by clicking on a Cast Button.
   *
   * Notes:
   * - on Android, the Cast Button needs to be rendered somewhere on the screen (can be hidden) in order for this method to work.
   * - on iOS 14+, the user has to first press the Cast Button manually and grant permissions (once per app install). Until then, this method will not work.
   *
   * @returns `true` if the Cast Dialog was shown, `false` if it was not shown.
   */
  static showCastDialog() {
    return Native.showCastDialog();
  }

  /**
   * Displays the Expanded Controls screen programmatically. Users can also open it by clicking on Mini Controls.
   *
   * @returns `true` if the Expanded Controls were shown, `false` if it was not shown.
   */
  static showExpandedControls() {
    return Native.showExpandedControls();
  }

  /**
   * If it has not been shown before, presents a fullscreen modal view controller that calls attention to the Cast button and displays some brief instructional text about its use.
   *
   * By default, the overlay is only displayed once. To change this, pass `once: false` in the options.
   *
   * @returns Promise that becomes `true` if the view controller was shown, `false` if it was not shown because it had already been shown before, or if the Cast Button was not found.
   */
  static showIntroductoryOverlay(options) {
    return Native.showIntroductoryOverlay({
      once: true,
      ...options
    });
  }

  /**
   * (Android only) Show a dialog with a localized message about the error state. Upon user confirmation (by tapping on dialog) will direct them to the Play Store if Google Play services is out of date or missing, or to system settings if Google Play services is disabled on the device.
   *
   * @param playServicesState state returned from {@link CastContext.getPlayServicesState}. If it's `success`, the dialog will not be shown.
   * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/common/GoogleApiAvailability#showErrorDialogFragment(android.app.Activity,%20int,%20int))
   */
  static showPlayServicesErrorDialog(playServicesState) {
    return Native.showPlayServicesErrorDialog(playServicesState);
  }

  /**
   * Listen for changes of the Cast State.
   *
   * @example
   * ```js
   * const subscription = CastContext.onCastStateChanged(castState => {
   *   if (castState === 'connected') {
   *     // ... ready to go
   *   }
   * })
   *
   * // later, to stop listening
   * subscription.remove()
   * ```
   */
  static onCastStateChanged(listener) {
    const eventEmitter = new NativeEventEmitter(Native);
    return eventEmitter.addListener(Native.CAST_STATE_CHANGED, listener);
  }
}
/** The DiscoveryManager to manage device discovery. */
_defineProperty(CastContext, "discoveryManager", new DiscoveryManager());
/** The SessionManager that manages cast sessions. */
_defineProperty(CastContext, "sessionManager", new SessionManager());
//# sourceMappingURL=CastContext.js.map