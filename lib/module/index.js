import CastContext from './api/CastContext';
export default CastContext;
export { CastContext };
export { default as CastChannel } from './api/CastChannel';
export { default as CastSession } from './api/CastSession';
export { default as DiscoveryManager } from './api/DiscoveryManager';
export { default as RemoteMediaClient } from './api/RemoteMediaClient';
export { default as SessionManager } from './api/SessionManager';
export { default as useCastChannel } from './api/useCastChannel';
export { default as useCastDevice } from './api/useCastDevice';
export { default as useCastState } from './api/useCastState';
export { default as useCastSession } from './api/useCastSession';
export { default as useDevices } from './api/useDevices';
export { default as useMediaStatus } from './api/useMediaStatus';
export { default as useRemoteMediaClient } from './api/useRemoteMediaClient';
export { default as useStreamPosition } from './api/useStreamPosition';
export { default as CastButton } from './components/CastButton';
export { default as ActiveInputState } from './types/ActiveInputState';
export { default as CastState } from './types/CastState';
export { default as MediaHlsSegmentFormat } from './types/MediaHlsSegmentFormat';
export { default as MediaHlsVideoSegmentFormat } from './types/MediaHlsVideoSegmentFormat';
// Trigger early initialization of the Cast SDK
// Do it immediately on load
console.log('[GoogleCast] Starting immediate initialization from index');
CastContext.initialize().catch(err => {
  console.warn('[GoogleCast] Immediate initialization failed:', err);
});

// Also set a timeout version as a backup
setTimeout(() => {
  console.log('[GoogleCast] Starting delayed initialization from index');
  CastContext.initialize().catch(err => {
    console.warn('[GoogleCast] Delayed initialization failed:', err);
  });
}, 1000); // Delay by 1 second as a backup
export { default as MediaPlayerIdleReason } from './types/MediaPlayerIdleReason';
export { default as MediaPlayerState } from './types/MediaPlayerState';
export { default as MediaQueueType } from './types/MediaQueueType';
export { default as MediaRepeatMode } from './types/MediaRepeatMode';
export { default as MediaStreamType } from './types/MediaStreamType';
export { default as PlayServicesState } from './types/PlayServicesState';
export { default as StandbyState } from './types/StandbyState';
// Utilities
export { default as resetCastSDK } from './utils/resetCastSDK';
//# sourceMappingURL=index.js.map