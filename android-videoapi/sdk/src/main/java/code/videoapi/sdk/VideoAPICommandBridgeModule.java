

package code.videoapi.sdk;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;

import code.videoapi.sdk.log.VideoAPILogger;

/**
 * Module implementing an API for sending events from JavaScript to native code.
 */
@ReactModule(name = VideoAPICommandBridgeModule.NAME)
public class VideoAPICommandBridgeModule
        extends ReactContextBaseJavaModule {

    public static final String NAME = "VideoAPICommandBridge";
    public static final String TOGGLE_VIDEO = "vToggleVideo";
    public static final String TOGGLE_AUDIO = "vToggleAudio";
    public static final String RAISE_HAND = "vToggleRaiseHand";
    public static final String TILE_VIEW = "vToggleTileView";

    private static final String TAG = NAME;

    /**
     * Initializes a new module instance. There shall be a single instance of
     * this module throughout the lifetime of the app.
     *
     * @param reactContext the {@link ReactApplicationContext} where this module
     * is created.
     */
    public VideoAPICommandBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    /**
     * Gets the name of this module to be used in the React Native bridge.
     *
     * @return The name of this module to be used in the React Native bridge.
     */
    @Override
    public String getName() {
        return NAME;
    }

    /**
     * Dispatches an event that occurred on the JavaScript side of the SDK to
     * the specified {@link BaseReactView}'s listener.
     *
     * @param name The name of the event.
     * @param data The details/specifics of the event to send determined
     * by/associated with the specified {@code name}.
     */
    @ReactMethod
    public void sendEvent(String name, Object data) {
        ReactInstanceManagerHolder.emitEvent(name, data);
    }

    public static VideoAPICommandBridgeModule getModule() {
        return ReactInstanceManagerHolder.getNativeModule(VideoAPICommandBridgeModule.class);
    }
}
