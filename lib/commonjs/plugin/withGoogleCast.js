"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _configPlugins = require("@expo/config-plugins");
var _withAndroidGoogleCast = require("./withAndroidGoogleCast");
var _withIosGoogleCast = require("./withIosGoogleCast");
const withGoogleCast = (config, _props) => {
  const props = _props || {};
  config = (0, _withIosGoogleCast.withIosGoogleCast)(config, {
    receiverAppId: props.iosReceiverAppId ?? props.receiverAppId,
    disableDiscoveryAutostart: props.iosDisableDiscoveryAutostart,
    expandedController: props.expandedController ?? true,
    suspendSessionsWhenBackgrounded: props.iosSuspendSessionsWhenBackgrounded,
    startDiscoveryAfterFirstTapOnCastButton: props.iosStartDiscoveryAfterFirstTapOnCastButton
  });
  config = (0, _withAndroidGoogleCast.withAndroidGoogleCast)(config, {
    receiverAppId: props.androidReceiverAppId ?? props.receiverAppId,
    expandedController: props.expandedController,
    androidPlayServicesCastFrameworkVersion: props.androidPlayServicesCastFrameworkVersion
  });
  return config;
};
var _default = exports.default = (0, _configPlugins.createRunOncePlugin)(withGoogleCast, 'react-native-google-cast');
//# sourceMappingURL=withGoogleCast.js.map