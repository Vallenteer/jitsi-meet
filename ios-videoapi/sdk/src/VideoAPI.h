/*
 * Copyright @ 2017-present 8x8, Inc.
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

@import UIKit;
@import Foundation;

#import <VideoAPISDK/VideoAPIConferenceOptions.h>
#import <VideoAPISDK/VideoAPIBridge.h>

@interface VideoAPI : NSObject

/**
 * Name for the conference NSUserActivity type. This is used when integrating with
 * SiriKit or Handoff, for example.
 */
@property (copy, nonatomic, nullable) NSString *conferenceActivityType;
/**
 * Custom URL scheme used for deep-linking.
 */
@property (copy, nonatomic, nullable) NSString *customUrlScheme;
/**
 * List of domains used for universal linking.
 */
@property (copy, nonatomic, nullable) NSArray<NSString *> *universalLinkDomains;
/**
 * Default conference options used for all conferences. These options will be merged
 * with those passed to VideoAPIView.join when joining a conference.
 */
@property (nonatomic, nullable) VideoAPIConferenceOptions *defaultConferenceOptions;

#pragma mark - This class is a singleton

+ (instancetype _Nonnull)sharedInstance;

#pragma mark - Methods that the App delegate must call

-             (BOOL)application:(UIApplication *_Nonnull)application
  didFinishLaunchingWithOptions:(NSDictionary *_Nonnull)launchOptions;

-    (BOOL)application:(UIApplication *_Nonnull)application
  continueUserActivity:(NSUserActivity *_Nonnull)userActivity
    restorationHandler:(void (^_Nullable)(NSArray<id<UIUserActivityRestoring>> *_Nonnull))restorationHandler;

- (BOOL)application:(UIApplication *_Nonnull)app
            openURL:(NSURL *_Nonnull)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *_Nonnull)options;

#pragma mark - Utility methods

- (VideoAPIConferenceOptions *_Nonnull)getInitialConferenceOptions;

- (BOOL)isCrashReportingDisabled;

- (void)showSplashScreen:(UIView * _Nonnull) rootView;

@end
