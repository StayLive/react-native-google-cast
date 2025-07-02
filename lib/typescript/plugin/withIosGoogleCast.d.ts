import { ConfigPlugin } from '@expo/config-plugins';
export declare const withIosGoogleCast: ConfigPlugin<{
    disableDiscoveryAutostart?: boolean;
    expandedController?: boolean;
    receiverAppId?: string;
    startDiscoveryAfterFirstTapOnCastButton?: boolean;
    suspendSessionsWhenBackgrounded?: boolean;
}>;
export declare const MATCH_INIT: RegExp;
type IosProps = {
    disableDiscoveryAutostart?: boolean;
    expandedController?: boolean;
    receiverAppId?: string | null;
    startDiscoveryAfterFirstTapOnCastButton?: boolean;
    suspendSessionsWhenBackgrounded?: boolean;
};
export declare function addGoogleCastAppDelegateDidFinishLaunchingWithOptions(src: string, { disableDiscoveryAutostart, expandedController, receiverAppId, startDiscoveryAfterFirstTapOnCastButton, suspendSessionsWhenBackgrounded, }?: IosProps): import("@expo/config-plugins/build/utils/generateCode").MergeResults;
export declare function addSwiftGoogleCastAppDelegateDidFinishLaunchingWithOptions(src: string, { disableDiscoveryAutostart, expandedController, receiverAppId, startDiscoveryAfterFirstTapOnCastButton, suspendSessionsWhenBackgrounded, }?: IosProps): string;
export {};
