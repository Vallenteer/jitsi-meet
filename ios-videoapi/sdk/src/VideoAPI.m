/*
 * Copyright @ 2019-present 8x8, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <Intents/Intents.h>

#import "Dropbox.h"
#import "VideoAPI+Private.h"
#import "VideoAPIConferenceOptions+Private.h"
#import "VideoAPIView+Private.h"
#import "RCTBridgeWrapper.h"
#import "ReactUtils.h"
#import "RNSplashScreen.h"

#import <RNGoogleSignin/RNGoogleSignin.h>
#import <WebRTC/RTCLogging.h>


@implementation VideoAPI {
    RCTBridgeWrapper *_bridgeWrapper;
    NSDictionary *_launchOptions;
}

#pragma mak - This class is a singleton

+ (instancetype)sharedInstance {
    static VideoAPI *sharedInstance = nil;
    static dispatch_once_t onceToken;

    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });

    return sharedInstance;
}

- (instancetype)init {
    if (self = [super init]) {
        // Initialize the on and only bridge for interfacing with React Native.
        _bridgeWrapper = [[RCTBridgeWrapper alloc] init];

        // Register a fatal error handler for React.
        registerReactFatalErrorHandler();

        // Register a log handler for React.
        registerReactLogHandler();

#if 0
        // Enable WebRTC logs
        RTCSetMinDebugLogLevel(RTCLoggingSeverityInfo);
#endif
    }

    return self;
}

#pragma mark - Methods that the App delegate must call

-             (BOOL)application:(UIApplication *)application
  didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    _launchOptions = [launchOptions copy];

    [Dropbox setAppKey];

    return YES;
}

-    (BOOL)application:(UIApplication *)application
  continueUserActivity:(NSUserActivity *)userActivity
    restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> *))restorationHandler {

    VideoAPIConferenceOptions *options = [self optionsFromUserActivity:userActivity];

    return options && [VideoAPIView setPropsInViews:[options asProps]];
}

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {

    if ([Dropbox application:app openURL:url options:options]) {
        return YES;
    }

    if ([RNGoogleSignin application:app
                            openURL:url
                            options:options]) {
        return YES;
    }

    if (_customUrlScheme == nil || ![_customUrlScheme isEqualToString:url.scheme]) {
        return NO;
    }

    VideoAPIConferenceOptions *conferenceOptions = [VideoAPIConferenceOptions fromBuilder:^(VideoAPIConferenceOptionsBuilder *builder) {
        builder.room = [url absoluteString];
    }];

    return [VideoAPIView setPropsInViews:[conferenceOptions asProps]];
}

#pragma mark - Utility methods

- (VideoAPIConferenceOptions *)getInitialConferenceOptions {
    if (_launchOptions[UIApplicationLaunchOptionsURLKey]) {
        NSURL *url = _launchOptions[UIApplicationLaunchOptionsURLKey];
        return [VideoAPIConferenceOptions fromBuilder:^(VideoAPIConferenceOptionsBuilder *builder) {
            builder.room = [url absoluteString];
        }];
    } else {
        NSDictionary *userActivityDictionary
            = _launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey];
        NSUserActivity *userActivity
            = [userActivityDictionary objectForKey:@"UIApplicationLaunchOptionsUserActivityKey"];
        if (userActivity != nil) {
            return [self optionsFromUserActivity:userActivity];
        }
    }

    return nil;
}

- (BOOL)isCrashReportingDisabled {
    NSUserDefaults *userDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"videoapi-default-preferences"];
    return [userDefaults stringForKey:@"isCrashReportingDisabled"];
}

- (VideoAPIConferenceOptions *)optionsFromUserActivity:(NSUserActivity *)userActivity {
    NSString *activityType = userActivity.activityType;

    if ([activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
        // App was started by opening a URL in the browser
        NSURL *url = userActivity.webpageURL;
        if ([_universalLinkDomains containsObject:url.host]) {
            return [VideoAPIConferenceOptions fromBuilder:^(VideoAPIConferenceOptionsBuilder *builder) {
                builder.room = [url absoluteString];
            }];
        }
    } else if ([activityType isEqualToString:@"INStartAudioCallIntent"]
               || [activityType isEqualToString:@"INStartVideoCallIntent"]) {
        // App was started by a CallKit Intent
        INIntent *intent = userActivity.interaction.intent;
        NSArray<INPerson *> *contacts;
        NSString *url;
        BOOL audioOnly = NO;

        if ([intent isKindOfClass:[INStartAudioCallIntent class]]) {
            contacts = ((INStartAudioCallIntent *) intent).contacts;
            audioOnly = YES;
        } else if ([intent isKindOfClass:[INStartVideoCallIntent class]]) {
            contacts = ((INStartVideoCallIntent *) intent).contacts;
        }

        if (contacts && (url = contacts.firstObject.personHandle.value)) {
            return [VideoAPIConferenceOptions fromBuilder:^(VideoAPIConferenceOptionsBuilder *builder) {
                builder.audioOnly = audioOnly;
                builder.room = url;
            }];
        }
    } else if (self.conferenceActivityType && [activityType isEqualToString:self.conferenceActivityType]) {
        // App was started by continuing a registered NSUserActivity (SiriKit, Handoff, ...)
        NSString *url;

        if ((url = userActivity.userInfo[@"url"])) {
            return [VideoAPIConferenceOptions fromBuilder:^(VideoAPIConferenceOptionsBuilder *builder) {
                builder.room = url;
            }];
        }
    }

    return nil;
}

- (void)showSplashScreen:(UIView*)rootView {
    [RNSplashScreen showSplash:@"LaunchScreen" inRootView:rootView];
}

#pragma mark - Property getter / setters

- (NSArray<NSString *> *)universalLinkDomains {
    return _universalLinkDomains ? _universalLinkDomains : @[];
}

- (void)setDefaultConferenceOptions:(VideoAPIConferenceOptions *)defaultConferenceOptions {
    if (defaultConferenceOptions != nil && _defaultConferenceOptions.room != nil) {
        @throw [NSException exceptionWithName:@"RuntimeError"
                                       reason:@"'room' must be null in the default conference options"
                                     userInfo:nil];
    }
    _defaultConferenceOptions = defaultConferenceOptions;
}

#pragma mark - Private API methods

- (NSDictionary *)getDefaultProps {
    return _defaultConferenceOptions == nil ? @{} : [_defaultConferenceOptions asProps];
}

- (RCTBridge *)getReactBridge {
    return _bridgeWrapper.bridge;
}


@end
