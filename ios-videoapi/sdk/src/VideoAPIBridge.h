
@import Foundation;

@interface VideoAPIBridge : NSObject

- (void)getDevicesList;
- (void)toggleAudio;
- (void)toggleVideo;
- (void)toggleRaiseHand;
- (void)toggleTileView;
+ (instancetype _Nonnull)sharedInstance;

@end
