#include "VideoAPIBridge.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

NSString *const VIDEOAPI_GET_DEVICES_LIST = @"vGetDevicesList";
NSString *const VIDEOAPI_TOGGLE_AUDIO = @"vToggleAudio";
NSString *const VIDEOAPI_TOGGLE_VIDEO = @"vToggleVideo";
NSString *const VIDEOAPI_TOGGLE_RAISE_HAND = @"vToggleRaiseHand";
NSString *const VIDEOAPI_TOGGLE_TILE_VIEW = @"vToggleTileView";

@interface VideoAPICommandBridge : RCTEventEmitter <RCTBridgeModule>
@end

@implementation VideoAPICommandBridge
RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
    return @[
        VIDEOAPI_GET_DEVICES_LIST,
        VIDEOAPI_TOGGLE_AUDIO,
        VIDEOAPI_TOGGLE_VIDEO,
        VIDEOAPI_TOGGLE_RAISE_HAND,
        VIDEOAPI_TOGGLE_TILE_VIEW
    ];
}

- (instancetype)init {
    if (self = [super init]) {
        [self subscribe];
    }
    return self;
}

- (void)getDevicesList {
    [self sendEventWithName:VIDEOAPI_GET_DEVICES_LIST body:@""];
}

- (void)toggleAudio {
    [self sendEventWithName:VIDEOAPI_TOGGLE_AUDIO body:@""];
}

- (void)toggleVideo {
    [self sendEventWithName:VIDEOAPI_TOGGLE_VIDEO body:@""];
}

- (void)toggleRaiseHand {
    [self sendEventWithName:VIDEOAPI_TOGGLE_RAISE_HAND body:@""];
}

- (void)toggleTileView {
    [self sendEventWithName:VIDEOAPI_TOGGLE_TILE_VIEW body:@""];
}

- (void)subscribe {
    [[NSNotificationCenter defaultCenter]
        addObserver:self
        selector:@selector(getDevicesList:)
        name:VIDEOAPI_GET_DEVICES_LIST
        object:nil];
    [[NSNotificationCenter defaultCenter]
        addObserver:self
        selector:@selector(toggleAudio:)
        name:VIDEOAPI_TOGGLE_AUDIO
        object:nil];
    [[NSNotificationCenter defaultCenter]
        addObserver:self
        selector:@selector(toggleVideo:)
        name:VIDEOAPI_TOGGLE_VIDEO
        object:nil];
    [[NSNotificationCenter defaultCenter]
        addObserver:self
        selector:@selector(toggleRaiseHand:)
        name:VIDEOAPI_TOGGLE_RAISE_HAND
        object:nil];
    [[NSNotificationCenter defaultCenter]
        addObserver:self
        selector:@selector(toggleTileView:)
        name:VIDEOAPI_TOGGLE_TILE_VIEW
        object:nil];
}
@end

@implementation VideoAPIBridge
+ (instancetype)sharedInstance {
    static VideoAPIBridge *instance = nil;
    static dispatch_once_t onceToken;

    dispatch_once(&onceToken, ^{
        instance = [[self alloc] init];
    });

    return instance;
}

- (void)getDevicesList {
    [[NSNotificationCenter defaultCenter]
        postNotificationName:VIDEOAPI_GET_DEVICES_LIST
        object:nil];
}

- (void)toggleAudio {
    [[NSNotificationCenter defaultCenter]
        postNotificationName:VIDEOAPI_TOGGLE_AUDIO
        object:nil];
        }

- (void)toggleVideo {
    [[NSNotificationCenter defaultCenter]
        postNotificationName:VIDEOAPI_TOGGLE_VIDEO
        object:nil];
}

- (void)toggleRaiseHand {
    [[NSNotificationCenter defaultCenter]
        postNotificationName:VIDEOAPI_TOGGLE_RAISE_HAND
        object:nil];
}

- (void)toggleTileView {
    [[NSNotificationCenter defaultCenter]
        postNotificationName:VIDEOAPI_TOGGLE_TILE_VIEW
        object:nil];
}
@end
