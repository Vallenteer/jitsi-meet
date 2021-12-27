

#include <mach/mach_time.h>

#import "VideoAPI+Private.h"
#import "VideoAPIConferenceOptions+Private.h"
#import "VideoAPIView+Private.h"
#import "ReactUtils.h"
#import "RNRootView.h"


/**
 * Backwards compatibility: turn the boolean prop into a feature flag.
 */
static NSString *const PiPEnabledFeatureFlag = @"pip.enabled";


@implementation VideoAPIView {
    /**
     * The unique identifier of this `VideoAPIView` within the process for the
     * purposes of `ExternalAPI`. The name scope was inspired by postis which we
     * use on Web for the similar purposes of the iframe-based external API.
     */
    NSString *externalAPIScope;

    /**
     * React Native view where the entire content will be rendered.
     */
    RNRootView *rootView;
}

/**
 * The `VideoAPIView`s associated with their `ExternalAPI` scopes (i.e. unique
 * identifiers within the process).
 */
static NSMapTable<NSString *, VideoAPIView *> *views;

/**
 * This gets called automagically when the program starts.
 */
__attribute__((constructor))
static void initializeViewsMap() {
    views = [NSMapTable strongToWeakObjectsMapTable];
}

#pragma mark Initializers

- (instancetype)init {
    self = [super init];
    if (self) {
        [self initWithXXX];
    }

    return self;
}

- (instancetype)initWithCoder:(NSCoder *)coder {
    self = [super initWithCoder:coder];
    if (self) {
        [self initWithXXX];
    }

    return self;
}

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        [self initWithXXX];
    }

    return self;
}

/**
 * Internal initialization:
 *
 * - sets the background color
 * - initializes the external API scope
 */
- (void)initWithXXX {
    // Hook this VideoAPIView into ExternalAPI.
    externalAPIScope = [NSUUID UUID].UUIDString;
    [views setObject:self forKey:externalAPIScope];

    // Set a background color which is in accord with the JavaScript and Android
    // parts of the application and causes less perceived visual flicker than
    // the default background color.
    self.backgroundColor
        = [UIColor colorWithRed:.07f green:.07f blue:.07f alpha:1];
}

#pragma mark API

- (void)join:(VideoAPIConferenceOptions *)options {
    [self setProps:options == nil ? @{} : [options asProps]];
}

- (void)leave {
    [self setProps:@{}];
}

#pragma mark Private methods

/**
 * Passes the given props to the React Native application. The props which we pass
 * are a combination of 3 different sources:
 *
 * - VideoAPI.defaultConferenceOptions
 * - This function's parameters
 * - Some extras which are added by this function
 */
- (void)setProps:(NSDictionary *_Nonnull)newProps {
    NSMutableDictionary *props = mergeProps([[VideoAPI sharedInstance] getDefaultProps], newProps);

    // Set the PiP flag if it wasn't manually set.
    NSMutableDictionary *featureFlags = props[@"flags"];
    if (featureFlags[PiPEnabledFeatureFlag] == nil) {
        featureFlags[PiPEnabledFeatureFlag]
            = [NSNumber numberWithBool:
               self.delegate && [self.delegate respondsToSelector:@selector(enterPictureInPicture:)]];
    }

    props[@"externalAPIScope"] = externalAPIScope;

    // This method is supposed to be imperative i.e. a second
    // invocation with one and the same URL is expected to join the respective
    // conference again if the first invocation was followed by leaving the
    // conference. However, React and, respectively,
    // appProperties/initialProperties are declarative expressions i.e. one and
    // the same URL will not trigger an automatic re-render in the JavaScript
    // source code. The workaround implemented bellow introduces imperativeness
    // in React Component props by defining a unique value per invocation.
    props[@"timestamp"] = @(mach_absolute_time());

    NSMutableDictionary *urlProps = props[@"url"];
    NSString *apiID = urlProps[@"apiID"];
    NSString *apiKey = urlProps[@"apiKey"];
    NSString *room = urlProps[@"room"];
    
    NSString *roomName = [NSString stringWithFormat:@"%@-%@", apiID, room];
    
    urlProps[@"room"] = roomName;
    props[@"url"] = urlProps;
    
    if (rootView) {
        // Update props with the new URL.
        rootView.appProperties = props;
    } else {
        RCTBridge *bridge = [[VideoAPI sharedInstance] getReactBridge];
        rootView
            = [[RNRootView alloc] initWithBridge:bridge
                                      moduleName:@"App"
                               initialProperties:props];
        rootView.backgroundColor = self.backgroundColor;

        // Add rootView as a subview which completely covers this one.
        [rootView setFrame:[self bounds]];
        rootView.autoresizingMask
            = UIViewAutoresizingFlexibleWidth
                | UIViewAutoresizingFlexibleHeight;
        [self addSubview:rootView];
    }
}

+ (BOOL)setPropsInViews:(NSDictionary *_Nonnull)newProps {
    BOOL handled = NO;

    if (views) {
        for (NSString *externalAPIScope in views) {
            VideoAPIView *view
                = [self viewForExternalAPIScope:externalAPIScope];

            if (view) {
                [view setProps:newProps];
                handled = YES;
            }
        }
    }

    return handled;
}

+ (instancetype)viewForExternalAPIScope:(NSString *)externalAPIScope {
    return [views objectForKey:externalAPIScope];
}

@end
