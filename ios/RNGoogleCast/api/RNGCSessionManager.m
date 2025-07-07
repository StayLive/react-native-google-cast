#import "RNGCSessionManager.h"
#import "RNGCRemoteMediaClient.h"
#import "../types/RCTConvert+GCKCastSession.h"
#import <Foundation/Foundation.h>

@implementation RNGCSessionManager {
  BOOL hasListeners;
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (NSDictionary *)constantsToExport {
  return @{
    @"SESSION_STARTING" : SESSION_STARTING,
    @"SESSION_STARTED" : SESSION_STARTED,
    @"SESSION_START_FAILED" : SESSION_START_FAILED,
    @"SESSION_SUSPENDED" : SESSION_SUSPENDED,
    @"SESSION_RESUMING" : SESSION_RESUMING,
    @"SESSION_RESUMED" : SESSION_RESUMED,
    @"SESSION_ENDING" : SESSION_ENDING,
    @"SESSION_ENDED" : SESSION_ENDED,
  };
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    SESSION_STARTING,
    SESSION_STARTED,
    SESSION_START_FAILED,
    SESSION_SUSPENDED,
    SESSION_RESUMING,
    SESSION_RESUMED,
    SESSION_ENDING,
    SESSION_ENDED,
  ];
}

// Will be called when this module's first listener is added.
- (void)startObserving {
  hasListeners = YES;
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastContext *castContext = [GCKCastContext sharedInstance];
    // If no cast context, initialize it
    if (!castContext) {
      GCKDiscoveryCriteria *criteria = [[GCKDiscoveryCriteria alloc] initWithApplicationID:kGCKDefaultMediaReceiverApplicationID];
      GCKCastOptions *options = [[GCKCastOptions alloc] initWithDiscoveryCriteria:criteria];
      options.disableDiscoveryAutostart = NO;
      options.startDiscoveryAfterFirstTapOnCastButton = NO;
      
      @try {
        [GCKCastContext setSharedInstanceWithOptions:options];
        castContext = [GCKCastContext sharedInstance];
      } @catch (NSException *exception) {
        return;
      }
    }
    
    if (!castContext) {
      return;
    }
    
    // Force discovery to start in iOS 18.5
    if (![castContext.discoveryManager discoveryActive]) {
      [castContext.discoveryManager startDiscovery];
    }
    
    if (!castContext.sessionManager) {
      return;
    }
    
    [castContext.sessionManager addListener:self];
  });
}

// Will be called when this module's last listener is removed, or on dealloc.
- (void)stopObserving {
  if (!hasListeners) { return; }
  hasListeners = NO;
  dispatch_async(dispatch_get_main_queue(), ^{
    [GCKCastContext.sharedInstance.sessionManager removeListener:self];
  });
}

- (void)invalidate {
  [self stopObserving];
}

RCT_EXPORT_METHOD(endCurrentSession: (BOOL)stopCasting
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [GCKCastContext.sharedInstance.sessionManager
     endSessionAndStopCasting:stopCasting];
    resolve(nil);
  });
}

RCT_EXPORT_METHOD(getCurrentCastSession: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastContext *castContext = [GCKCastContext sharedInstance];
    // If no cast context, initialize it
    if (!castContext) {
      GCKDiscoveryCriteria *criteria = [[GCKDiscoveryCriteria alloc] initWithApplicationID:kGCKDefaultMediaReceiverApplicationID];
      GCKCastOptions *options = [[GCKCastOptions alloc] initWithDiscoveryCriteria:criteria];
      options.disableDiscoveryAutostart = NO;
      options.startDiscoveryAfterFirstTapOnCastButton = NO; // Critical for iOS 18.5
      
      @try {
        [GCKCastContext setSharedInstanceWithOptions:options];
        castContext = [GCKCastContext sharedInstance];
      } @catch (NSException *exception) {
        NSLog(@"[GoogleCast] Failed to initialize Cast SDK: %@", exception.reason);
        reject(@"initialization_error", [NSString stringWithFormat:@"Failed to initialize Cast SDK: %@", exception.reason], nil);
        return;
      }
    }
    
    if (!castContext) {
      NSLog(@"[GoogleCast] Cast context still not available after initialization attempt");
      reject(@"no_context", @"Cast context not available", nil);
      return;
    }
    
    // Force discovery to start to ensure devices can be found
    if (![castContext.discoveryManager discoveryActive]) {
      NSLog(@"[GoogleCast] Discovery not active in getCurrentCastSession, starting it");
      [castContext.discoveryManager startDiscovery];
    }
    
    // Ensure we have session manager listener registered
    GCKSessionManager *sessionManager = castContext.sessionManager;
    if (!sessionManager) {
      NSLog(@"[GoogleCast] Session manager not available");
      reject(@"no_session_manager", @"Session manager not available", nil);
      return;
    }
    
    // Important: Make sure we're listening to the session manager
    [sessionManager addListener:self];
    
    NSLog(@"[GoogleCast] Returning current cast session");
    resolve([RCTConvert fromGCKCastSession:sessionManager.currentCastSession]);
  });
}

RCT_EXPORT_METHOD(startSession: (NSString *)deviceId
                  resolve: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKDiscoveryManager *discoveryManager = GCKCastContext.sharedInstance.discoveryManager;

    GCKDevice *device;
    for (int i = 0; i < [discoveryManager deviceCount]; i++) {
      GCKDevice *d = [discoveryManager deviceAtIndex:i];
      if ([d.deviceID isEqualToString:deviceId]) {
        device = d;
        break;
      }
    }

    if (device) {
      GCKSessionManager *sessionManager = GCKCastContext.sharedInstance.sessionManager;
      resolve(@([sessionManager startSessionWithDevice:device]));
    } else {
      resolve(FALSE);
    }
  });
}


- (void)sessionManager:(GCKSessionManager *)sessionManager
    willStartCastSession:(GCKCastSession *)session {
  [self sendEventWithName:SESSION_STARTING body:@{
    @"session": [RCTConvert fromGCKCastSession:session]
  }];
}

- (void)sessionManager:(GCKSessionManager *)sessionManager
    didStartCastSession:(GCKCastSession *)session {
  [self sendEventWithName:SESSION_STARTED body:@{
    @"session": [RCTConvert fromGCKCastSession:session]
  }];
}

- (void)sessionManager:(GCKSessionManager *)sessionManager
    didFailToStartCastSession:(GCKCastSession *)session
                    withError:(NSError *)error {
  [self sendEventWithName:SESSION_START_FAILED body:@{
    @"session": [RCTConvert fromGCKCastSession:session],
    @"error": [error localizedDescription]
  }];
}

- (void)sessionManager:(GCKSessionManager *)sessionManager
    didSuspendCastSession:(GCKCastSession *)session
               withReason:(GCKConnectionSuspendReason)reason {
  [self sendEventWithName:SESSION_SUSPENDED body:@{
    @"session": [RCTConvert fromGCKCastSession:session]
    // TODO @"reason": [RCTConvert fromGCKConnectionSuspendReason:reason]
  }];
}

- (void)sessionManager:(GCKSessionManager *)sessionManager
    willResumeCastSession:(GCKCastSession *)session {
  [self sendEventWithName:SESSION_RESUMING body:@{
    @"session": [RCTConvert fromGCKCastSession:session]
  }];
}

- (void)sessionManager:(GCKSessionManager *)sessionManager
    didResumeCastSession:(GCKCastSession *)session {
  [self sendEventWithName:SESSION_RESUMED body:@{
    @"session": [RCTConvert fromGCKCastSession:session]
  }];
}

- (void)sessionManager:(GCKSessionManager *)sessionManager
    willEndCastSession:(GCKCastSession *)session {
  [self sendEventWithName:SESSION_ENDING body:@{
    @"session": [RCTConvert fromGCKCastSession:session]
  }];
}

- (void)sessionManager:(GCKSessionManager *)sessionManager
     didEndCastSession:(GCKCastSession *)session
             withError:(nullable NSError *)error {
  [self sendEventWithName:SESSION_ENDED body:@{
    @"session": [RCTConvert fromGCKCastSession:session],
    @"error": error == nil ? [NSNull null] : [error localizedDescription]
  }];
}

@end
