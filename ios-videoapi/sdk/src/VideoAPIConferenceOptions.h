
#import <Foundation/Foundation.h>

#import "VideoAPIUserInfo.h"

FOUNDATION_EXPORT NSString * _Nonnull const VIDEOAPI_TOOLBOX_ENABLED;
FOUNDATION_EXPORT NSString * _Nonnull const VIDEOAPI_TOOLBAR_BUTTONS;

@interface VideoAPIConferenceOptionsBuilder : NSObject

/**
 * API ID.
 */
@property (nonatomic, copy, nullable) NSString *apiID;
/**
 * API Key.
 */
@property (nonatomic, copy, nullable) NSString *apiKey;
/**
 * Room name.
 */
@property (nonatomic, copy, nullable) NSString *room;
/**
 * Conference subject.
 */
@property (nonatomic, copy, nullable) NSString *subject;
/**
 * JWT token used for authentication.
 */
@property (nonatomic, copy, nullable) NSString *token;

/**
 * Color scheme override, see:
 * https://github.com/jitsi/VideoAPI/blob/master/react/features/base/color-scheme/defaultScheme.js
 */
@property (nonatomic, copy, nullable) NSDictionary *colorScheme;

/**
 * Feature flags. See: https://github.com/jitsi/VideoAPI/blob/master/react/features/base/flags/constants.js
 */
@property (nonatomic, readonly, nonnull) NSDictionary *featureFlags;

/**
 * Set to YES to join the conference with audio / video muted or to start in audio
 * only mode respectively.
 */
@property (nonatomic) BOOL audioOnly;
@property (nonatomic) BOOL audioMuted;
@property (nonatomic) BOOL videoMuted;

/**
 * Set to YES to enable the welcome page. Typically SDK users won't need this enabled
 * since the host application decides which meeting to join.
 */
@property (nonatomic) BOOL welcomePageEnabled;

/**
 * Information about the local user. It will be used in absence of a token.
 */
@property (nonatomic, nullable) VideoAPIUserInfo *userInfo;

- (void)setFeatureFlag:(NSString *_Nonnull)flag withBoolean:(BOOL)value;
- (void)setFeatureFlag:(NSString *_Nonnull)flag withValue:(id _Nonnull)value;

@end

@interface VideoAPIConferenceOptions : NSObject

@property (nonatomic, copy, nullable, readonly) NSURL *serverURL;
@property (nonatomic, copy, nullable, readonly) NSString *apiID;
@property (nonatomic, copy, nullable, readonly) NSString *apiKey;

@property (nonatomic, copy, nullable, readonly) NSString *room;
@property (nonatomic, copy, nullable, readonly) NSString *subject;
@property (nonatomic, copy, nullable, readonly) NSString *token;

@property (nonatomic, copy, nullable) NSDictionary *colorScheme;
@property (nonatomic, readonly, nonnull) NSDictionary *featureFlags;

@property (nonatomic, readonly) BOOL audioOnly;
@property (nonatomic, readonly) BOOL audioMuted;
@property (nonatomic, readonly) BOOL videoMuted;

@property (nonatomic, readonly) BOOL welcomePageEnabled;

@property (nonatomic, nullable) VideoAPIUserInfo *userInfo;

+ (instancetype _Nonnull)fromBuilder:(void (^_Nonnull)(VideoAPIConferenceOptionsBuilder *_Nonnull))initBlock;
- (instancetype _Nonnull)init NS_UNAVAILABLE;

@end
