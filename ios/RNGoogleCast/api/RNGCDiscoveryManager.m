#import "RNGCDiscoveryManager.h"
#import "../types/RCTConvert+GCKDevice.h"

#import <Foundation/Foundation.h>

@implementation RNGCDiscoveryManager {
  BOOL hasListeners;
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (NSDictionary *)constantsToExport {
  return @{
    @"DEVICES_UPDATED" : DEVICES_UPDATED,
  };
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    DEVICES_UPDATED
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
        NSLog(@"Failed to initialize GCKCastContext: %@", exception.reason);
        return;
      }
    }
    
    // Start discovery explicitly
    if (![castContext.discoveryManager discoveryActive]) {
      [castContext.discoveryManager startDiscovery];
    }
    
    [castContext.discoveryManager addListener:self];
  });
}

// Will be called when this module's last listener is removed, or on dealloc.
- (void)stopObserving {
  if (!hasListeners) { return; }
  hasListeners = NO;
  dispatch_async(dispatch_get_main_queue(), ^{
    [GCKCastContext.sharedInstance.discoveryManager removeListener:self];
  });
}

- (void)invalidate {
  [self stopObserving];
}

RCT_EXPORT_METHOD(getDevices: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    resolve([self getDevices]);
  });
}

-(void)didUpdateDeviceList {
  [self sendEventWithName:DEVICES_UPDATED body:[self getDevices]];
}

RCT_EXPORT_METHOD(isPassiveScan: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    resolve(@([GCKCastContext.sharedInstance.discoveryManager passiveScan]));
  });
}

RCT_EXPORT_METHOD(isRunning: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastContext *castContext = [GCKCastContext sharedInstance];
    if (!castContext) {
      // If no cast context, initialize it
      GCKDiscoveryCriteria *criteria = [[GCKDiscoveryCriteria alloc] initWithApplicationID:kGCKDefaultMediaReceiverApplicationID];
      GCKCastOptions *options = [[GCKCastOptions alloc] initWithDiscoveryCriteria:criteria];
      options.disableDiscoveryAutostart = NO;
      options.startDiscoveryAfterFirstTapOnCastButton = NO;
      
      @try {
        [GCKCastContext setSharedInstanceWithOptions:options];
        castContext = [GCKCastContext sharedInstance];
      } @catch (NSException *exception) {
        resolve(@(NO));
        return;
      }
    }
    
    BOOL isRunning = [castContext.discoveryManager discoveryActive];
    resolve(@(isRunning));
  });
}

RCT_EXPORT_METHOD(setPassiveScan: (BOOL) on
                  resolver: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [GCKCastContext.sharedInstance.discoveryManager setPassiveScan:on];
    resolve(nil);
  });
}

RCT_EXPORT_METHOD(startDiscovery: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GCKCastContext *castContext = [GCKCastContext sharedInstance];
    // Ensure cast context is properly initialized
    if (!castContext) {
      // If not initialized, try to initialize with default settings
      GCKDiscoveryCriteria *criteria = [[GCKDiscoveryCriteria alloc] initWithApplicationID:kGCKDefaultMediaReceiverApplicationID];
      GCKCastOptions *options = [[GCKCastOptions alloc] initWithDiscoveryCriteria:criteria];
      options.disableDiscoveryAutostart = NO;
      options.startDiscoveryAfterFirstTapOnCastButton = NO; // Important for iOS 18.5
      
      @try {
        [GCKCastContext setSharedInstanceWithOptions:options];
        castContext = [GCKCastContext sharedInstance];
      } @catch (NSException *exception) {
        reject(@"initialization_error", [NSString stringWithFormat:@"Failed to initialize Cast SDK: %@", exception.reason], nil);
        return;
      }
    }
    
    // Check if discovery options need to be updated for iOS 18.5
    if (@available(iOS 18.0, *)) {
      // For iOS 18+ specifically set these options
      castContext.discoveryManager.passiveScan = NO;
    }
    
    [castContext.discoveryManager startDiscovery];
    resolve(nil);
  });
}

RCT_EXPORT_METHOD(stopDiscovery: (RCTPromiseResolveBlock) resolve
                  rejecter: (RCTPromiseRejectBlock) reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [GCKCastContext.sharedInstance.discoveryManager stopDiscovery];
    resolve(nil);
  });
}

-(NSMutableArray<id> *)getDevices {
  NSMutableArray<id> *devices = [[NSMutableArray alloc] init];

  GCKCastContext *castContext = [GCKCastContext sharedInstance];
  // Safety check to ensure we have a valid Cast context
  if (!castContext) {
    return devices;
  }
  
  GCKDiscoveryManager *discoveryManager = castContext.discoveryManager;
  if (!discoveryManager) {
    return devices;
  }
  
  // Ensure discovery is active
  if (![discoveryManager discoveryActive]) {
    [discoveryManager startDiscovery];
  }
  
  NSUInteger deviceCount = [discoveryManager deviceCount];
  for (int i = 0; i < deviceCount; i++) {
    GCKDevice *device = [discoveryManager deviceAtIndex:i];
    [devices addObject:[RCTConvert fromGCKDevice:device]];
  }
  
  return devices;
}

@end
