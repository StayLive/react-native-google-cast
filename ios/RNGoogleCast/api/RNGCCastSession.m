#import "RNGCCastSession.h"
#import "RNGCRequest.h"
#import "../types/RCTConvert+GCKActiveInputStatus.h"
#import "../types/RCTConvert+GCKApplicationMetadata.h"
#import "../types/RCTConvert+GCKCastChannel.h"
#import "../types/RCTConvert+GCKCastSession.h"
#import "../types/RCTConvert+GCKDevice.h"
#import "../types/RCTConvert+GCKStandbyStatus.h"
#import <Foundation/Foundation.h>

@implementation RNGCCastSession {
  bool hasListeners;
  NSMutableDictionary *channels;
  GCKCastSession *castSession;
}

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (instancetype)init {
  if (self = [super init]) {
    channels = [[NSMutableDictionary alloc] init];
    castSession = nil;
  }
  return self;
}

- (NSDictionary *)constantsToExport {
  return @{
    @"ACTIVE_INPUT_STATE_CHANGED": ACTIVE_INPUT_STATE_CHANGED,
    @"CHANNEL_MESSAGE_RECEIVED": CHANNEL_MESSAGE_RECEIVED,
    @"CHANNEL_UPDATED": CHANNEL_UPDATED,
    @"STANDBY_STATE_CHANGED": STANDBY_STATE_CHANGED,
  };
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    ACTIVE_INPUT_STATE_CHANGED,
    CHANNEL_MESSAGE_RECEIVED,
    CHANNEL_UPDATED,
    STANDBY_STATE_CHANGED,
  ];
}

- (void)startObserving {
  hasListeners = YES;
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastContext *castContext = [GCKCastContext sharedInstance];
    if (!castContext || !castContext.sessionManager) {
      return;
    }
    
    [castContext.sessionManager addListener:self];
    
    GCKCastSession *session = [castContext.sessionManager currentCastSession];
    if (session != nil) {
      self->castSession = session;
      [session addDeviceStatusListener:self];
    }
  });
}

- (void)stopObserving {
  if (!hasListeners) { return; }
  hasListeners = NO;
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastContext *castContext = [GCKCastContext sharedInstance];
    if (castContext && castContext.sessionManager) {
      [castContext.sessionManager removeListener:self];
    }
    
    if (self->castSession != nil) {
      [self->castSession removeDeviceStatusListener:self];
      self->castSession = nil;
    }
  });
}

- (void)invalidate {
  [self stopObserving];
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastContext *castContext = [GCKCastContext sharedInstance];
    if (castContext && castContext.sessionManager) {
      [castContext.sessionManager removeListener:self];
    }
    self->castSession = nil;
  });
}

# pragma mark - Helper methods

- (GCKCastSession *)getCurrentCastSession {
  GCKCastContext *castContext = [GCKCastContext sharedInstance];
  if (!castContext || !castContext.sessionManager) {
    return nil;
  }
  
  GCKCastSession *currentSession = [castContext.sessionManager currentCastSession];
  
  // Sync our cached session with the current session
  if (currentSession != castSession) {
    if (castSession) {
      [castSession removeDeviceStatusListener:self];
    }
    castSession = currentSession;
    if (castSession && hasListeners) {
      [castSession addDeviceStatusListener:self];
    }
  }
  
  return currentSession;
}

# pragma mark - GCKCastSession methods

RCT_EXPORT_METHOD(getActiveInputState: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    resolve([RCTConvert fromGCKActiveInputStatus:[session activeInputStatus]]);
  });
}

RCT_EXPORT_METHOD(getApplicationMetadata: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    resolve([RCTConvert fromGCKApplicationMetadata:[session applicationMetadata]]);
  });
}

RCT_EXPORT_METHOD(getApplicationStatus: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    resolve([session deviceStatusText]);
  });
}

RCT_EXPORT_METHOD(getCastDevice: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    resolve([RCTConvert fromGCKDevice:[session device]]);
  });
}

RCT_EXPORT_METHOD(getStandbyState: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    resolve([RCTConvert fromGCKStandbyStatus:[session standbyStatus]]);
  });
}

RCT_EXPORT_METHOD(getVolume: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    resolve(@([session currentDeviceVolume]));
  });
}

RCT_EXPORT_METHOD(isMute: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    resolve(@([session currentDeviceMuted]));
  });
}

RCT_EXPORT_METHOD(setMute: (BOOL)mute
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    GCKRequest *request = [session setDeviceMuted:mute];
    [RNGCRequest promisifyRequest:request resolve:resolve reject:reject];
  });
}

RCT_EXPORT_METHOD(setVolume: (float)volume
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    GCKRequest *request = [session setDeviceVolume:volume];
    [RNGCRequest promisifyRequest:request resolve:resolve reject:reject];
  });
}

# pragma mark - GCKCastDeviceStatusListener events

- (void)castSession:(GCKCastSession *)castSession didReceiveActiveInputStatus:(GCKActiveInputStatus)activeInputStatus {
  if (!hasListeners) return;
  [self sendEventWithName:ACTIVE_INPUT_STATE_CHANGED body:[RCTConvert fromGCKActiveInputStatus:activeInputStatus]];
}

- (void)castSession:(GCKCastSession *)castSession didReceiveStandbyStatus:(GCKStandbyStatus)standbyStatus {
  if (!hasListeners) return;
  [self sendEventWithName:STANDBY_STATE_CHANGED body:[RCTConvert fromGCKStandbyStatus:standbyStatus]];
}

# pragma mark - GCKCastChannel methods

RCT_EXPORT_METHOD(addChannel: (NSString *)namespace
                  resolver: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    
    GCKGenericChannel *channel = [[GCKGenericChannel alloc] initWithNamespace:namespace];
    channel.delegate = self;
    [session addChannel:channel];
    [self->channels setObject:channel forKey:namespace];
    resolve([RCTConvert fromGCKCastChannel:channel]);
  });
}

RCT_EXPORT_METHOD(removeChannel: (NSString *)namespace
                  resolver: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject) {
  GCKCastChannel *channel = self->channels[namespace];
  if (channel == nil) { return resolve(nil); }
  
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastSession *session = [self getCurrentCastSession];
    if (!session) {
      reject(@"no_session", @"No active cast session", nil);
      return;
    }
    
    [self->channels removeObjectForKey:namespace];
    [session removeChannel:channel];
    resolve(nil);
  });
}

RCT_EXPORT_METHOD(sendMessage: (NSString *)namespace
                  message: (NSString *)message
                  resolver: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject) {
  GCKCastChannel *channel = channels[namespace];
  if (!channel) {
    NSError *error = [NSError errorWithDomain:NSCocoaErrorDomain code:GCKErrorCodeChannelNotConnected userInfo:nil];
    return reject(@"no_channel", [NSString stringWithFormat:@"Channel for namespace %@ does not exist. Did you forget to call addChannel?", namespace], error);
  }

  NSError *error;
  [channel sendTextMessage:message error:&error];
  if (error == nil) {
    resolve(nil);
  } else {
    reject(error.localizedFailureReason, error.localizedDescription, error);
  }
}

# pragma mark - GCKCastChannel events

- (void)castChannelDidConnect:(GCKGenericChannel *)channel {
  if (!hasListeners) return;
  [self sendEventWithName:CHANNEL_UPDATED body:[RCTConvert fromGCKCastChannel:channel]];
}

- (void)castChannelDidDisconnect:(GCKGenericChannel *)channel {
  if (!hasListeners) return;
  [self sendEventWithName:CHANNEL_UPDATED body:[RCTConvert fromGCKCastChannel:channel]];
}

- (void)castChannel:(GCKGenericChannel *)channel
    didReceiveTextMessage:(NSString *)message
            withNamespace:(NSString *)protocolNamespace {
  if (!hasListeners) return;
  id body = [RCTConvert fromGCKCastChannel:channel];
  body[@"message"] = message;
  [self sendEventWithName:CHANNEL_MESSAGE_RECEIVED body:body];
}

- (void)castChannel:(GCKCastChannel *)channel didChangeWritableState:(BOOL)writable {
  if (!hasListeners) return;
  [self sendEventWithName:CHANNEL_UPDATED body:[RCTConvert fromGCKCastChannel:channel]];
}

# pragma mark - GCKSessionManager events

- (void)sessionManager:(GCKSessionManager *)sessionManager didStartCastSession:(GCKCastSession *)session {
  self->castSession = session;
  [session addDeviceStatusListener:self];
}

- (void)sessionManager:(GCKSessionManager *)sessionManager didResumeCastSession:(GCKCastSession *)session {
  self->castSession = session;
  [session addDeviceStatusListener:self];
}

- (void)sessionManager:(GCKSessionManager *)sessionManager willEndCastSession:(GCKCastSession *)session {
  self->castSession = nil;
  [session removeDeviceStatusListener:self];
}

@end
