import { ConfigPlugin } from '@expo/config-plugins';
declare const _default: ConfigPlugin<void | {
    /**
     * Version for the Android Cast SDK.
     *
     * @default '+' (latest)
     */
    androidPlayServicesCastFrameworkVersion?: string | undefined;
    androidReceiverAppId?: string | undefined;
    /**
     * Whether to use the default expanded controller.
     *
     * @default true
     * @see https://react-native-google-cast.github.io/docs/components/ExpandedController
     */
    expandedController?: boolean | undefined;
    /**
     * Whether the discovery of Cast devices should not start automatically at context initialization time.
     *
     * @default false
     * @see https://react-native-google-cast.github.io/docs/getting-started/setup#ios
     */
    iosDisableDiscoveryAutostart?: boolean | undefined;
    iosReceiverAppId?: string | undefined;
    /**
     * Whether cast devices discovery start only after a user taps on the Cast button the first time.
     *
     * @default true
     * @see https://react-native-google-cast.github.io/docs/getting-started/setup#ios
     */
    iosStartDiscoveryAfterFirstTapOnCastButton?: boolean | undefined;
    /**
     * Whether sessions should be suspended when the sender application goes into the background (and resumed when it returns to the foreground). You can set this to `false` in applications that are able to maintain network connections indefinitely while in the background.
     *
     * @default true
     */
    iosSuspendSessionsWhenBackgrounded?: boolean | undefined;
    /**
     * Custom receiver app id. Same as setting both `iosReceiverAppId` and `androidReceiverAppId`.
     *
     * @default 'CC1AD845'
     */
    receiverAppId?: string | undefined;
}>;
export default _default;
