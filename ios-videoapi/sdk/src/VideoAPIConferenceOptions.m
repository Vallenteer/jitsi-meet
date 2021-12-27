

#import <React/RCTUtils.h>

#import "VideoAPIConferenceOptions+Private.h"
#import "VideoAPIUserInfo+Private.h"

/**
 * Backwards compatibility: turn the boolean property into a feature flag.
 */
static NSString *const WelcomePageEnabledFeatureFlag = @"welcomepage.enabled";
NSString *const VIDEOAPI_TOOLBOX_ENABLED = @"toolbox.enabled";
NSString *const VIDEOAPI_TOOLBAR_BUTTONS = @"toolbar.buttons";


@implementation VideoAPIConferenceOptionsBuilder {
    NSNumber *_audioOnly;
    NSNumber *_audioMuted;
    NSNumber *_videoMuted;
    NSMutableDictionary *_featureFlags;
}

@dynamic audioOnly;
@dynamic audioMuted;
@dynamic videoMuted;
@dynamic welcomePageEnabled;

- (instancetype)init {
    if (self = [super init]) {
        _room = nil;
        _subject = nil;
        _token = nil;

        _colorScheme = nil;
        _featureFlags = [[NSMutableDictionary alloc] init];

        _audioOnly = nil;
        _audioMuted = nil;
        _videoMuted = nil;

        _userInfo = nil;
    }
    
    return self;
}

- (void)setFeatureFlag:(NSString *)flag withBoolean:(BOOL)value {
    [self setFeatureFlag:flag withValue:[NSNumber numberWithBool:value]];
}

- (void)setFeatureFlag:(NSString *)flag withValue:(id)value {
    _featureFlags[flag] = value;
}

#pragma mark - Dynamic properties

- (void)setAudioOnly:(BOOL)audioOnly {
    _audioOnly = [NSNumber numberWithBool:audioOnly];
}

- (BOOL)audioOnly {
    return _audioOnly && [_audioOnly boolValue];
}

- (void)setAudioMuted:(BOOL)audioMuted {
    _audioMuted = [NSNumber numberWithBool:audioMuted];
}

- (BOOL)audioMuted {
    return _audioMuted && [_audioMuted boolValue];
}

- (void)setVideoMuted:(BOOL)videoMuted {
    _videoMuted = [NSNumber numberWithBool:videoMuted];
}

- (BOOL)videoMuted {
    return _videoMuted && [_videoMuted boolValue];
}

- (void)setWelcomePageEnabled:(BOOL)welcomePageEnabled {
    [self setFeatureFlag:WelcomePageEnabledFeatureFlag
               withBoolean:welcomePageEnabled];
}

- (BOOL)welcomePageEnabled {
    NSNumber *n = _featureFlags[WelcomePageEnabledFeatureFlag];

    return n != nil ? [n boolValue] : NO;
}

#pragma mark - Private API

- (NSNumber *)getAudioOnly {
    return _audioOnly;
}

- (NSNumber *)getAudioMuted {
    return _audioMuted;
}

- (NSNumber *)getVideoMuted {
    return _videoMuted;
}

@end

@implementation VideoAPIConferenceOptions {
    NSNumber *_audioOnly;
    NSNumber *_audioMuted;
    NSNumber *_videoMuted;
    NSDictionary *_featureFlags;
}

@dynamic audioOnly;
@dynamic audioMuted;
@dynamic videoMuted;
@dynamic welcomePageEnabled;

#pragma mark - Dynamic properties

- (NSURL*)serverURL {
    return [NSURL URLWithString:@"https://video.ngagevideoapi.com"];
}

- (BOOL)audioOnly {
    return _audioOnly && [_audioOnly boolValue];
}

- (BOOL)audioMuted {
    return _audioMuted && [_audioMuted boolValue];
}

- (BOOL)videoMuted {
    return _videoMuted && [_videoMuted boolValue];
}

- (BOOL)welcomePageEnabled {
    NSNumber *n = _featureFlags[WelcomePageEnabledFeatureFlag];

    return n != nil ? [n boolValue] : NO;
}

#pragma mark - Internal initializer

- (instancetype)initWithBuilder:(VideoAPIConferenceOptionsBuilder *)builder {
    if (self = [super init]) {
        _apiID = builder.apiID;
        _apiKey = builder.apiKey;
        _room = builder.room;
        _subject = builder.subject;
        _token = builder.token;

        _colorScheme = builder.colorScheme;

        _audioOnly = [builder getAudioOnly];
        _audioMuted = [builder getAudioMuted];
        _videoMuted = [builder getVideoMuted];

        _featureFlags = [NSDictionary dictionaryWithDictionary:builder.featureFlags];

        _userInfo = builder.userInfo;
    }

    return self;
}

#pragma mark - API

+ (instancetype)fromBuilder:(void (^)(VideoAPIConferenceOptionsBuilder *))initBlock {
    VideoAPIConferenceOptionsBuilder *builder = [[VideoAPIConferenceOptionsBuilder alloc] init];
    initBlock(builder);
    return [[VideoAPIConferenceOptions alloc] initWithBuilder:builder];
}

#pragma mark - Private API

- (NSDictionary *)asProps {
    NSMutableDictionary *props = [[NSMutableDictionary alloc] init];

    props[@"flags"] = [NSMutableDictionary dictionaryWithDictionary:_featureFlags];

    if (_colorScheme != nil) {
        props[@"colorScheme"] = self.colorScheme;
    }

    NSMutableDictionary *config = [[NSMutableDictionary alloc] init];
    if (_audioOnly != nil) {
        config[@"startAudioOnly"] = @(self.audioOnly);
    }
    if (_audioMuted != nil) {
        config[@"startWithAudioMuted"] = @(self.audioMuted);
    }
    if (_videoMuted != nil) {
        config[@"startWithVideoMuted"] = @(self.videoMuted);
    }
    if (_subject != nil) {
        config[@"subject"] = self.subject;
    }

    NSMutableDictionary *urlProps = [[NSMutableDictionary alloc] init];

    // The room is fully qualified.
    if (_room != nil && [_room containsString:@"://"]) {
        urlProps[@"url"] = _room;
    } else {
        urlProps[@"serverURL"] = self.serverURL;

        if (_room != nil) {
            urlProps[@"room"] = _room;
        }
    }

    if (_token != nil) {
        urlProps[@"jwt"] = _token;
    }

    if (_userInfo != nil) {
        props[@"userInfo"] = [self.userInfo asDict];
    }

    if (_apiID != nil) {
        urlProps[@"apiID"] = _apiID;
    }
    
    if (_apiKey != nil) {
        urlProps[@"apiKey"] = _apiKey;
    }
    
    props[@"package"] = [[NSBundle mainBundle] bundleIdentifier];
    props[@"platform"] = @"ios";
    
    urlProps[@"config"] = config;
    props[@"url"] = urlProps;

    return props;
}

@end
