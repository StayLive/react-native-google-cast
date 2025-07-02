"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ActiveInputState", {
  enumerable: true,
  get: function () {
    return _ActiveInputState.default;
  }
});
Object.defineProperty(exports, "CastButton", {
  enumerable: true,
  get: function () {
    return _CastButton.default;
  }
});
Object.defineProperty(exports, "CastChannel", {
  enumerable: true,
  get: function () {
    return _CastChannel.default;
  }
});
Object.defineProperty(exports, "CastContext", {
  enumerable: true,
  get: function () {
    return _CastContext.default;
  }
});
Object.defineProperty(exports, "CastSession", {
  enumerable: true,
  get: function () {
    return _CastSession.default;
  }
});
Object.defineProperty(exports, "CastState", {
  enumerable: true,
  get: function () {
    return _CastState.default;
  }
});
Object.defineProperty(exports, "DiscoveryManager", {
  enumerable: true,
  get: function () {
    return _DiscoveryManager.default;
  }
});
Object.defineProperty(exports, "MediaHlsSegmentFormat", {
  enumerable: true,
  get: function () {
    return _MediaHlsSegmentFormat.default;
  }
});
Object.defineProperty(exports, "MediaHlsVideoSegmentFormat", {
  enumerable: true,
  get: function () {
    return _MediaHlsVideoSegmentFormat.default;
  }
});
Object.defineProperty(exports, "MediaPlayerIdleReason", {
  enumerable: true,
  get: function () {
    return _MediaPlayerIdleReason.default;
  }
});
Object.defineProperty(exports, "MediaPlayerState", {
  enumerable: true,
  get: function () {
    return _MediaPlayerState.default;
  }
});
Object.defineProperty(exports, "MediaQueueType", {
  enumerable: true,
  get: function () {
    return _MediaQueueType.default;
  }
});
Object.defineProperty(exports, "MediaRepeatMode", {
  enumerable: true,
  get: function () {
    return _MediaRepeatMode.default;
  }
});
Object.defineProperty(exports, "MediaStreamType", {
  enumerable: true,
  get: function () {
    return _MediaStreamType.default;
  }
});
Object.defineProperty(exports, "PlayServicesState", {
  enumerable: true,
  get: function () {
    return _PlayServicesState.default;
  }
});
Object.defineProperty(exports, "RemoteMediaClient", {
  enumerable: true,
  get: function () {
    return _RemoteMediaClient.default;
  }
});
Object.defineProperty(exports, "SessionManager", {
  enumerable: true,
  get: function () {
    return _SessionManager.default;
  }
});
Object.defineProperty(exports, "StandbyState", {
  enumerable: true,
  get: function () {
    return _StandbyState.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "useCastChannel", {
  enumerable: true,
  get: function () {
    return _useCastChannel.default;
  }
});
Object.defineProperty(exports, "useCastDevice", {
  enumerable: true,
  get: function () {
    return _useCastDevice.default;
  }
});
Object.defineProperty(exports, "useCastSession", {
  enumerable: true,
  get: function () {
    return _useCastSession.default;
  }
});
Object.defineProperty(exports, "useCastState", {
  enumerable: true,
  get: function () {
    return _useCastState.default;
  }
});
Object.defineProperty(exports, "useDevices", {
  enumerable: true,
  get: function () {
    return _useDevices.default;
  }
});
Object.defineProperty(exports, "useMediaStatus", {
  enumerable: true,
  get: function () {
    return _useMediaStatus.default;
  }
});
Object.defineProperty(exports, "useRemoteMediaClient", {
  enumerable: true,
  get: function () {
    return _useRemoteMediaClient.default;
  }
});
Object.defineProperty(exports, "useStreamPosition", {
  enumerable: true,
  get: function () {
    return _useStreamPosition.default;
  }
});
var _CastContext = _interopRequireDefault(require("./api/CastContext"));
var _CastChannel = _interopRequireDefault(require("./api/CastChannel"));
var _CastSession = _interopRequireDefault(require("./api/CastSession"));
var _DiscoveryManager = _interopRequireDefault(require("./api/DiscoveryManager"));
var _RemoteMediaClient = _interopRequireDefault(require("./api/RemoteMediaClient"));
var _SessionManager = _interopRequireDefault(require("./api/SessionManager"));
var _useCastChannel = _interopRequireDefault(require("./api/useCastChannel"));
var _useCastDevice = _interopRequireDefault(require("./api/useCastDevice"));
var _useCastState = _interopRequireDefault(require("./api/useCastState"));
var _useCastSession = _interopRequireDefault(require("./api/useCastSession"));
var _useDevices = _interopRequireDefault(require("./api/useDevices"));
var _useMediaStatus = _interopRequireDefault(require("./api/useMediaStatus"));
var _useRemoteMediaClient = _interopRequireDefault(require("./api/useRemoteMediaClient"));
var _useStreamPosition = _interopRequireDefault(require("./api/useStreamPosition"));
var _CastButton = _interopRequireDefault(require("./components/CastButton"));
var _ActiveInputState = _interopRequireDefault(require("./types/ActiveInputState"));
var _CastState = _interopRequireDefault(require("./types/CastState"));
var _MediaHlsSegmentFormat = _interopRequireDefault(require("./types/MediaHlsSegmentFormat"));
var _MediaHlsVideoSegmentFormat = _interopRequireDefault(require("./types/MediaHlsVideoSegmentFormat"));
var _MediaPlayerIdleReason = _interopRequireDefault(require("./types/MediaPlayerIdleReason"));
var _MediaPlayerState = _interopRequireDefault(require("./types/MediaPlayerState"));
var _MediaQueueType = _interopRequireDefault(require("./types/MediaQueueType"));
var _MediaRepeatMode = _interopRequireDefault(require("./types/MediaRepeatMode"));
var _MediaStreamType = _interopRequireDefault(require("./types/MediaStreamType"));
var _PlayServicesState = _interopRequireDefault(require("./types/PlayServicesState"));
var _StandbyState = _interopRequireDefault(require("./types/StandbyState"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = exports.default = _CastContext.default;
// Trigger early initialization of the Cast SDK
setTimeout(() => {
  console.log('[GoogleCast] Starting early initialization from index');
  _CastContext.default.initialize().catch(err => {
    console.warn('[GoogleCast] Early initialization failed:', err);
  });
}, 0);
//# sourceMappingURL=index.js.map