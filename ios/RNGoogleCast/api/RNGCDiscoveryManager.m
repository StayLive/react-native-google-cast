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
    NSLog(@"[GoogleCast] Checking if discovery is running");
    GCKCastContext *castContext = [GCKCastContext sharedInstance];
    if (!castContext) {
      NSLog(@"[GoogleCast] No cast context found in isRunning, initializing");
      // If no cast context, initialize it
      GCKDiscoveryCriteria *criteria = [[GCKDiscoveryCriteria alloc] initWithApplicationID:kGCKDefaultMediaReceiverApplicationID];
      GCKCastOptions *options = [[GCKCastOptions alloc] initWithDiscoveryCriteria:criteria];
      options.disableDiscoveryAutostart = NO;
      options.startDiscoveryAfterFirstTapOnCastButton = NO; // Critical for iOS 18.5
      
      @try {
        [GCKCastContext setSharedInstanceWithOptions:options];
        castContext = [GCKCastContext sharedInstance];
        NSLog(@"[GoogleCast] Cast context initialized successfully in isRunning");
      } @catch (NSException *exception) {
        NSLog(@"[GoogleCast] Failed to initialize Cast SDK in isRunning: %@", exception.reason);
        resolve(@(NO));
        return;
      }
    }
    
    if (!castContext) {
      NSLog(@"[GoogleCast] Cast context still not available after initialization attempt in isRunning");
      resolve(@(NO));
      return;
    }
    
    if (!castContext.discoveryManager) {
      NSLog(@"[GoogleCast] Discovery manager not available in isRunning");
      resolve(@(NO));
      return;
    }
    
    BOOL isRunning = [castContext.discoveryManager discoveryActive];
    NSLog(@"[GoogleCast] Discovery running: %@", isRunning ? @"YES" : @"NO");
    
    // If discovery is not running, try to start it
    if (!isRunning) {
      NSLog(@"[GoogleCast] Discovery not active in isRunning, starting it");
      [castContext.discoveryManager startDiscovery];
      isRunning = [castContext.discoveryManager discoveryActive];
      NSLog(@"[GoogleCast] Discovery now running: %@", isRunning ? @"YES" : @"NO");
    }
    
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
    NSLog(@"[GoogleCast] Starting discovery");
    GCKCastContext *castContext = [GCKCastContext sharedInstance];
    // Ensure cast context is properly initialized
    if (!castContext) {
      NSLog(@"[GoogleCast] No cast context found, initializing");
      // If not initialized, try to initialize with default settings
      GCKDiscoveryCriteria *criteria = [[GCKDiscoveryCriteria alloc] initWithApplicationID:kGCKDefaultMediaReceiverApplicationID];
      GCKCastOptions *options = [[GCKCastOptions alloc] initWithDiscoveryCriteria:criteria];
      options.disableDiscoveryAutostart = NO;
      options.startDiscoveryAfterFirstTapOnCastButton = NO; // Important for iOS 18.5
      
      @try {
        [GCKCastContext setSharedInstanceWithOptions:options];
        castContext = [GCKCastContext sharedInstance];
        NSLog(@"[GoogleCast] Cast context initialized successfully");
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
    
    // Ensure we have the SessionManager and add our listener
    if (castContext.sessionManager) {
      // Find RNGCSessionManager instance
      Class sessionManagerClass = NSClassFromString(@"RNGCSessionManager");
      if (sessionManagerClass) {
        id sessionManager = [[sessionManagerClass alloc] init];
        if (sessionManager && [sessionManager respondsToSelector:@selector(startObserving)]) {
          [sessionManager performSelector:@selector(startObserving)];
          NSLog(@"[GoogleCast] Forced SessionManager to start observing");
        }
      }
    }
    
    // Check if discovery options need to be updated for iOS 18.5
    if (@available(iOS 18.0, *)) {
      // For iOS 18+ specifically set these options
      NSLog(@"[GoogleCast] Configuring iOS 18+ specific settings");
      castContext.discoveryManager.passiveScan = NO;
    }
    
    // Force discovery to start even if it's already running
    // This helps in iOS 18.5 where discovery might be in a bad state
    if (![castContext.discoveryManager discoveryActive]) {
      NSLog(@"[GoogleCast] Discovery not active, starting it now");
    } else {
      NSLog(@"[GoogleCast] Discovery already active, restarting for consistency");
      [castContext.discoveryManager stopDiscovery];
      // Give a small delay before restarting
      [NSThread sleepForTimeInterval:0.1];
    }
    
    [castContext.discoveryManager startDiscovery];
    NSLog(@"[GoogleCast] Discovery started successfully");
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
    NSLog(@"[GoogleCast] No cast context found in getDevices, attempting to initialize");
    // Initialize the Cast SDK if not already initialized
    GCKDiscoveryCriteria *criteria = [[GCKDiscoveryCriteria alloc] initWithApplicationID:kGCKDefaultMediaReceiverApplicationID];
    GCKCastOptions *options = [[GCKCastOptions alloc] initWithDiscoveryCriteria:criteria];
    options.disableDiscoveryAutostart = NO;
    options.startDiscoveryAfterFirstTapOnCastButton = NO; // Critical for iOS 18.5
    
    @try {
      [GCKCastContext setSharedInstanceWithOptions:options];
      castContext = [GCKCastContext sharedInstance];
      NSLog(@"[GoogleCast] Cast context initialized successfully in getDevices");
    } @catch (NSException *exception) {
      NSLog(@"[GoogleCast] Failed to initialize Cast SDK in getDevices: %@", exception.reason);
      return devices;
    }
    
    if (!castContext) {
      NSLog(@"[GoogleCast] Cast context still not available after initialization attempt in getDevices");
      return devices;
    }
  }
  
  GCKDiscoveryManager *discoveryManager = castContext.discoveryManager;
  if (!discoveryManager) {
    NSLog(@"[GoogleCast] Discovery manager not available in getDevices");
    return devices;
  }
  
  // Ensure discovery is active
  if (![discoveryManager discoveryActive]) {
    NSLog(@"[GoogleCast] Discovery not active in getDevices, starting it");
    [discoveryManager startDiscovery];
  }
  
  // Check if discovery options need to be updated for iOS 18.5
  if (@available(iOS 18.0, *)) {
    // For iOS 18+ specifically set these options
    discoveryManager.passiveScan = NO;
  }
  
  NSUInteger deviceCount = [discoveryManager deviceCount];
  NSLog(@"[GoogleCast] Found %lu devices", (unsigned long)deviceCount);
  
  for (int i = 0; i < deviceCount; i++) {
    GCKDevice *device = [discoveryManager deviceAtIndex:i];
    [devices addObject:[RCTConvert fromGCKDevice:device]];
  }
  
  return devices;
}

@end
