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

package code.videoapi.sdk;

import android.os.Bundle;
import android.os.Parcel;
import android.os.Parcelable;

import java.net.URL;
import java.net.MalformedURLException;


/**
 * This class represents the options when joining a VideoAPI conference. The user can create an
 * instance by using {@link VideoAPIConferenceOptions.Builder} and setting the desired options
 * there.
 * <p>
 * The resulting {@link VideoAPIConferenceOptions} object is immutable and represents how the
 * conference will be joined.
 */
public class VideoAPIConferenceOptions implements Parcelable {

    public static final String TOOLBOX_ENABLED = "toolbox.enabled";
    public static final String TOOLBAR_BUTTONS = "toolbar.buttons";

    /**
     * API Key
     */
    private String apiKey;

    /**
     * API ID
     */
    private String apiID;

    /**
     * Server where the conference should take place.
     */
    private URL serverURL;
    /**
     * Room name.
     */
    private String room;
    /**
     * Conference subject.
     */
    private String subject;
    /**
     * JWT token used for authentication.
     */
    private String token;

    /**
     * Color scheme override, see: https://github.com/jitsi/jitsi-meet/blob/dbedee5e22e5dcf9c92db96ef5bb3c9982fc526d/react/features/base/color-scheme/defaultScheme.js
     */
    private Bundle colorScheme;

    /**
     * Feature flags. See: https://github.com/jitsi/jitsi-meet/blob/master/react/features/base/flags/constants.js
     */
    private Bundle featureFlags;

    /**
     * Set to {@code true} to join the conference with audio / video muted or to start in audio
     * only mode respectively.
     */
    private Boolean audioMuted;
    private Boolean audioOnly;
    private Boolean videoMuted;

    /**
     * USer information, to be used when no token is specified.
     */
    private VideoAPIUserInfo userInfo;

    public String getAPIKey() {
        return apiKey;
    }

    public String getAPIID() {
        return apiID;
    }

    public URL getServerURL() throws MalformedURLException {
        return new URL("http://videoapi.ngagevideoapi.com/");
    }

    public String getRoom() {
        return room;
    }

    public boolean isRoomUnset() {
        if (room != null) {
            return room.isEmpty();
        }
        return true;
    }

    public String getSubject() {
        return subject;
    }

    public String getToken() {
        return token;
    }

    public Bundle getColorScheme() {
        return colorScheme;
    }

    public Bundle getFeatureFlags() {
        return featureFlags;
    }

    public boolean getAudioMuted() {
        return audioMuted;
    }

    public boolean getAudioOnly() {
        return audioOnly;
    }

    public boolean getVideoMuted() {
        return videoMuted;
    }

    public VideoAPIUserInfo getUserInfo() {
        return userInfo;
    }

    /**
     * Class used to build the immutable {@link VideoAPIConferenceOptions} object.
     */
    public static class Builder {
        private String apiKey;
        private String apiID;
        private URL serverURL;
        private String room;
        private String subject;
        private String token;

        private Bundle colorScheme;
        private Bundle featureFlags;

        private Boolean audioMuted;
        private Boolean audioOnly;
        private Boolean videoMuted;

        private VideoAPIUserInfo userInfo;

        public Builder() {
            featureFlags = new Bundle();
        }

        /**
         * \
         * Sets the API ID
         *
         * @param apiID - The API ID
         * @return - The {@link Builder} object itself so the method calls can be chained.
         */
        public Builder setAPIID(String apiID) {
            this.apiID = apiID;

            return this;
        }

        /**
         * \
         * Sets the API Key
         *
         * @param apiKey - The API Key
         * @return - The {@link Builder} object itself so the method calls can be chained.
         */
        public Builder setAPIKey(String apiKey) {
            this.apiKey = apiKey;

            return this;
        }


        /**
         * Sets the room where the conference will take place.
         *
         * @param room - Name of the room.
         * @return - The {@link Builder} object itself so the method calls can be chained.
         */
        public Builder setRoom(String room) {
            this.room = room;

            return this;
        }

        /**
         * Sets the conference subject.
         *
         * @param subject - Subject for the conference.
         * @return - The {@link Builder} object itself so the method calls can be chained.
         */
        public Builder setSubject(String subject) {
            this.subject = subject;

            return this;
        }

        /**
         * Sets the JWT token to be used for authentication when joining a conference.
         *
         * @param token - The JWT token to be used for authentication.
         * @return - The {@link Builder} object itself so the method calls can be chained.
         */
        public Builder setToken(String token) {
            this.token = token;

            return this;
        }

        /**
         * Sets the color scheme override so the app is themed. See:
         * https://github.com/jitsi/jitsi-meet/blob/master/react/features/base/color-scheme/defaultScheme.js
         * for the structure.
         *
         * @param colorScheme - A color scheme to be applied to the app.
         * @return - The {@link Builder} object itself so the method calls can be chained.
         */
        public Builder setColorScheme(Bundle colorScheme) {
            this.colorScheme = colorScheme;

            return this;
        }

        /**
         * Indicates the conference will be joined with the microphone muted.
         *
         * @param muted - Muted indication.
         * @return - The {@link Builder} object itself so the method calls can be chained.
         */
        public Builder setAudioMuted(boolean muted) {
            this.audioMuted = muted;

            return this;
        }

        /**
         * Indicates the conference will be joined in audio-only mode. In this mode no video is
         * sent or received.
         *
         * @param audioOnly - Audio-mode indicator.
         * @return - The {@link Builder} object itself so the method calls can be chained.
         */
        public Builder setAudioOnly(boolean audioOnly) {
            this.audioOnly = audioOnly;

            return this;
        }

        /**
         * Indicates the conference will be joined with the camera muted.
         *
         * @param videoMuted - Muted indication.
         * @return - The {@link Builder} object itself so the method calls can be chained.
         */
        public Builder setVideoMuted(boolean videoMuted) {
            this.videoMuted = videoMuted;

            return this;
        }



        public Builder setFeatureFlag(String flag, boolean value) {
            this.featureFlags.putBoolean(flag, value);

            return this;
        }

        public Builder setFeatureFlag(String flag, String value) {
            this.featureFlags.putString(flag, value);

            return this;
        }

        public Builder setFeatureFlag(String flag, int value) {
            this.featureFlags.putInt(flag, value);

            return this;
        }

        public Builder setUserInfo(VideoAPIUserInfo userInfo) {
            this.userInfo = userInfo;

            return this;
        }

        /**
         * Builds the immutable {@link VideoAPIConferenceOptions} object with the configuration
         * that this {@link Builder} instance specified.
         *
         * @return - The built {@link VideoAPIConferenceOptions} object.
         */
        public VideoAPIConferenceOptions build() {
            VideoAPIConferenceOptions options = new VideoAPIConferenceOptions();

            options.apiKey = this.apiKey;
            options.apiID = this.apiID;
            options.serverURL = this.serverURL;
            options.room = this.room;
            options.subject = this.subject;
            options.token = this.token;
            options.colorScheme = this.colorScheme;
            options.featureFlags = this.featureFlags;
            options.audioMuted = this.audioMuted;
            options.audioOnly = this.audioOnly;
            options.videoMuted = this.videoMuted;
            options.userInfo = this.userInfo;

            return options;
        }
    }

    private VideoAPIConferenceOptions() {
    }

    private VideoAPIConferenceOptions(Parcel in) {
        apiID = in.readString();
        apiKey = in.readString();

        serverURL = (URL) in.readSerializable();
        room = in.readString();
        subject = in.readString();
        token = in.readString();
        colorScheme = in.readBundle();
        featureFlags = in.readBundle();
        userInfo = new VideoAPIUserInfo(in.readBundle());
        byte tmpAudioMuted = in.readByte();
        audioMuted = tmpAudioMuted == 0 ? null : tmpAudioMuted == 1;
        byte tmpAudioOnly = in.readByte();
        audioOnly = tmpAudioOnly == 0 ? null : tmpAudioOnly == 1;
        byte tmpVideoMuted = in.readByte();
        videoMuted = tmpVideoMuted == 0 ? null : tmpVideoMuted == 1;
    }

    Bundle asProps() {
        Bundle props = new Bundle();

        // Android always has the PiP flag set by default.
        if (!featureFlags.containsKey("pip.enabled")) {
            featureFlags.putBoolean("pip.enabled", true);
        }

        props.putBundle("flags", featureFlags);

        if (colorScheme != null) {
            props.putBundle("colorScheme", colorScheme);
        }

        Bundle config = new Bundle();

        if (audioMuted != null) {
            config.putBoolean("startWithAudioMuted", audioMuted);
        }
        if (audioOnly != null) {
            config.putBoolean("startAudioOnly", audioOnly);
        }
        if (videoMuted != null) {
            config.putBoolean("startWithVideoMuted", videoMuted);
        }
        if (subject != null) {
            config.putString("subject", subject);
        }

        Bundle urlProps = new Bundle();


        if (serverURL != null) {
            urlProps.putString("serverURL", serverURL.toString());
        }
        if (room != null) {
            urlProps.putString("room", room);
        }


        if (apiKey != null) {
            urlProps.putString("apiKey", apiKey);
        }

        if (apiID != null) {
            urlProps.putString("apiID", apiID);
        }

        if (token != null) {
            urlProps.putString("jwt", token);
        }

        if (userInfo != null) {
            props.putBundle("userInfo", userInfo.asBundle());
        }

        urlProps.putBundle("config", config);
        props.putBundle("url", urlProps);

        return props;
    }

    // Parcelable interface
    //

    public static final Creator<VideoAPIConferenceOptions> CREATOR = new Creator<VideoAPIConferenceOptions>() {
        @Override
        public VideoAPIConferenceOptions createFromParcel(Parcel in) {
            return new VideoAPIConferenceOptions(in);
        }

        @Override
        public VideoAPIConferenceOptions[] newArray(int size) {
            return new VideoAPIConferenceOptions[size];
        }
    };

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(apiID);
        dest.writeString(apiKey);

        dest.writeSerializable(serverURL);
        dest.writeString(room);
        dest.writeString(subject);
        dest.writeString(token);
        dest.writeBundle(colorScheme);
        dest.writeBundle(featureFlags);
        dest.writeBundle(userInfo != null ? userInfo.asBundle() : new Bundle());
        dest.writeByte((byte) (audioMuted == null ? 0 : audioMuted ? 1 : 2));
        dest.writeByte((byte) (audioOnly == null ? 0 : audioOnly ? 1 : 2));
        dest.writeByte((byte) (videoMuted == null ? 0 : videoMuted ? 1 : 2));
    }

    @Override
    public int describeContents() {
        return 0;
    }
}
