function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { NativeEventEmitter, NativeModules } from 'react-native';
import CastChannel from './CastChannel';
import RemoteMediaClient from './RemoteMediaClient';
import CastContext from './CastContext';
const {
  RNGCCastSession: Native
} = NativeModules;

/**
 * Cast sessions are created and managed automatically by the {@link SessionManager}, for example when the user selects a Cast device from the media route controller dialog. The current active CastSession can be accessed by {@link CastContext.getCurrentCastSession}.
 *
 * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/cast/framework/CastSession) | [iOS](https://developers.google.com/cast/docs/reference/ios/interface_g_c_k_cast_session) | [Chrome](https://developers.google.com/cast/docs/reference/chrome/cast.framework.CastSession)
 *
 * @example
 * ```js
 * import { useCastSession } from 'react-native-google-cast'
 *
 * function MyComponent() {
 *   const castSession = useCastSession()
 *
 *   if (castSession) {
 *     // ...
 *   }
 * }
 * ```
 */
export default class CastSession {
  constructor(args) {
    _defineProperty(this, "client", void 0);
    _defineProperty(this, "clientInitialized", false);
    _defineProperty(this, "initializationAttempts", 0);
    _defineProperty(this, "MAX_INIT_ATTEMPTS", 3);
    /** Unique session ID. */
    _defineProperty(this, "id", void 0);
    this.id = args.id;
    this.client = new RemoteMediaClient();
    console.log('[GoogleCast] Creating CastSession', this.id ? `with ID: ${this.id}` : 'without ID');

    // Ensure CastContext is initialized
    CastContext.initialize().catch(err => {
      console.warn('[GoogleCast] Error ensuring CastContext initialization in session:', err);
    });

    // Initialize client with retry logic
    this.initializeClient();
  }

  /**
   * Initialize the RemoteMediaClient with retries to ensure it's properly connected
   */
  initializeClient() {
    if (this.clientInitialized || this.initializationAttempts >= this.MAX_INIT_ATTEMPTS) {
      return;
    }
    this.initializationAttempts++;
    if (!this.id) {
      console.warn('[GoogleCast] Cannot initialize client without session ID');
      return;
    }
    console.log(`[GoogleCast] Initializing client, attempt ${this.initializationAttempts}/${this.MAX_INIT_ATTEMPTS}`);

    // First try to verify if the client can connect
    setTimeout(() => {
      this.client.getMediaStatus().then(status => {
        console.log('[GoogleCast] Client initialized successfully');
        this.clientInitialized = true;
        if (status) {
          console.log('[GoogleCast] Media status is available:', JSON.stringify(status));
        } else {
          console.log('[GoogleCast] No active media found');
        }
      }).catch(err => {
        console.warn(`[GoogleCast] Error initializing client (attempt ${this.initializationAttempts}/${this.MAX_INIT_ATTEMPTS}):`, err);

        // Try again with a longer delay
        if (this.initializationAttempts < this.MAX_INIT_ATTEMPTS) {
          setTimeout(() => {
            this.initializeClient();
          }, 1000 * this.initializationAttempts); // Increasing delay with each attempt
        }
      });
    }, 500); // Initial delay
  }

  /**
   * Creates a channel for sending custom messages between this sender and the Cast receiver. Use when you've built a custom receiver and want to communicate with it.
   *
   * @param namespace A custom channel identifier starting with `urn:x-cast:`, for example `urn:x-cast:com.reactnative.googlecast.example`. The namespace name is arbitrary; just make sure it's unique.
   */
  addChannel(namespace) {
    return CastChannel.add(namespace);
  }

  /**
   * Indicates whether a receiver device is currently the active video input.
   * Active input state can only be reported when the Google cast device is connected to a TV or AVR with CEC support.
   */
  getActiveInputState() {
    return Native.getActiveInputState();
  }

  /**
   * Returns the metadata for the currently running receiver application, or `null` if the metadata is unavailable.
   *
   * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/cast/framework/CastSession.html#getApplicationMetadata()) | [iOS](https://developers.google.com/cast/docs/reference/ios/interface_g_c_k_cast_session.html#aa48324aeb26bd15ec3b7e052138ea48c) | [Chrome](https://developers.google.com/cast/docs/reference/chrome/cast.framework.CastSession#getApplicationMetadata)
   */
  getApplicationMetadata() {
    return Native.getApplicationMetadata();
  }

  /**
   * Returns the current receiver application status, if any. Message text is localized to the Google Cast device's locale.
   *
   * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/cast/framework/CastSession.html#getApplicationStatus()) | [iOS](https://developers.google.com/cast/docs/reference/ios/interface_g_c_k_session#a1821f77bc0c0dc159419608105483a0a) _deviceStatusText_ | [Chrome](https://developers.google.com/cast/docs/reference/chrome/cast.framework.CastSession#getApplicationStatus)
   */
  getApplicationStatus() {
    return Native.getApplicationStatus();
  }

  /**
   * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/cast/framework/CastSession.html#getCastDevice()) | [iOS](https://developers.google.com/cast/docs/reference/ios/interface_g_c_k_session#a30d6130e558b235e37f1cbded2d27ce8) | [Chrome](https://developers.google.com/cast/docs/reference/chrome/cast.framework.CastSession#getCastDevice)
   */
  getCastDevice() {
    return Native.getCastDevice();
  }
  getClient() {
    // If client initialization wasn't successful, try again
    if (!this.clientInitialized && this.id) {
      console.log('[GoogleCast] Client not initialized, retrying in getClient');
      this.initializeClient();
    }
    return this.client;
  }

  /**
   * Force refresh the client connection. Call this if you suspect the client might be in a bad state.
   */
  refreshClient() {
    this.clientInitialized = false;
    this.initializationAttempts = 0;
    this.initializeClient();
    return new Promise(resolve => {
      setTimeout(() => {
        // Check if client is working by trying to get media status
        this.client.getMediaStatus().then(() => {
          console.log('[GoogleCast] Client refreshed successfully');
          resolve(true);
        }).catch(() => {
          console.warn('[GoogleCast] Client refresh failed');
          resolve(false);
        });
      }, 1000);
    });
  }

  /**
   * Indicates whether a receiver device's connected TV or AVR is currently in "standby" mode.
   */
  getStandbyState() {
    return Native.getStandbyState();
  }

  /**
   * Returns the device's volume.
   *
   * @returns {number} Volume in the range [0.0, 1.0].
   * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/cast/framework/CastSession.html#getVolume()) | [iOS](https://developers.google.com/cast/docs/reference/ios/interface_g_c_k_session#af4120ee98a679c4ed3abc6ba6b59cf12)
   */
  getVolume() {
    return Native.getVolume();
  }

  /**
   * @returns {boolean}
   * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/cast/framework/CastSession.html#isMute())
   */
  isMute() {
    return Native.isMute();
  }

  /**
   * Listen for changes to the active input state.
   *
   * @example
   * ```js
   * const subscription = session.onActiveInputStateChanged(state => { ... })
   *
   * // later, to stop listening
   * subscription.remove()
   * ```
   */
  onActiveInputStateChanged(listener) {
    const eventEmitter = new NativeEventEmitter(Native);
    return eventEmitter.addListener(Native.ACTIVE_INPUT_STATE_CHANGED, listener);
  }

  /**
   * Listen for changes to the standby state.
   *
   * @example
   * ```js
   * const subscription = session.onStandbyStateChanged(state => { ... })
   *
   * // later, to stop listening
   * subscription.remove()
   * ```
   */
  onStandbyStateChanged(listener) {
    const eventEmitter = new NativeEventEmitter(Native);
    return eventEmitter.addListener(Native.STANDBY_STATE_CHANGED, listener);
  }

  /**
   * Mutes or unmutes the device's audio.
   *
   * Note that this method doesn't currently resolve a promise. You may instead call `client.setStreamMuted()` which handles promises correctly.
   *
   * @param mute The new mute state.
   * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/cast/framework/CastSession.html#setMute(boolean)) | [iOS](https://developers.google.com/cast/docs/reference/ios/interface_g_c_k_session#aac1dc4461b6d7ae6f1f5f9dc93cafebd)
   */
  setMute(mute) {
    return Native.setMute(mute);
  }

  /**
   * Sets the device volume.
   *
   * Note that this method doesn't currently resolve a promise. You may instead call `client.setStreamVolume()` which handles promises correctly.
   *
   * @param volume If volume is outside of the range [0.0, 1.0], then the value will be clipped.
   * @see [Android](https://developers.google.com/android/reference/com/google/android/gms/cast/framework/CastSession.html#setVolume(double)) | [iOS](https://developers.google.com/cast/docs/reference/ios/interface_g_c_k_session#a68dcca2fdf1f4aebee394f0af56e7fb8)
   */
  setVolume(volume) {
    return Native.setVolume(volume);
  }
}
//# sourceMappingURL=CastSession.js.map