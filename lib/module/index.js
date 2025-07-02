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
setTimeout(() => {
  console.log('[GoogleCast] Starting early initialization from index');
  CastContext.initialize().catch(err => {
    console.warn('[GoogleCast] Early initialization failed:', err);
  });
}, 0);
export { default as MediaPlayerIdleReason } from './types/MediaPlayerIdleReason';
export { default as MediaPlayerState } from './types/MediaPlayerState';
export { default as MediaQueueType } from './types/MediaQueueType';
export { default as MediaRepeatMode } from './types/MediaRepeatMode';
export { default as MediaStreamType } from './types/MediaStreamType';
export { default as PlayServicesState } from './types/PlayServicesState';
export { default as StandbyState } from './types/StandbyState';
//# sourceMappingURL=index.js.map