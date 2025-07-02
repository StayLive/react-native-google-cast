import { createRunOncePlugin } from '@expo/config-plugins';
import { withAndroidGoogleCast } from './withAndroidGoogleCast';
import { withIosGoogleCast } from './withIosGoogleCast';
const withGoogleCast = (config, _props) => {
  const props = _props || {};
  config = withIosGoogleCast(config, {
    receiverAppId: props.iosReceiverAppId ?? props.receiverAppId,
    disableDiscoveryAutostart: props.iosDisableDiscoveryAutostart,
    expandedController: props.expandedController ?? true,
    suspendSessionsWhenBackgrounded: props.iosSuspendSessionsWhenBackgrounded,
    startDiscoveryAfterFirstTapOnCastButton: props.iosStartDiscoveryAfterFirstTapOnCastButton
  });
  config = withAndroidGoogleCast(config, {
    receiverAppId: props.androidReceiverAppId ?? props.receiverAppId,
    expandedController: props.expandedController,
    androidPlayServicesCastFrameworkVersion: props.androidPlayServicesCastFrameworkVersion
  });
  return config;
};
export default createRunOncePlugin(withGoogleCast, 'react-native-google-cast');
//# sourceMappingURL=withGoogleCast.js.map