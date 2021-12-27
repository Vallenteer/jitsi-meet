package code.videoapi.test;
import android.content.Context;
import android.content.Intent;
import android.graphics.Rect;
import android.os.Bundle;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ToggleButton;

import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.PermissionListener;

import java.util.Map;

import code.videoapi.sdk.VideoAPICommandBridgeModule;
import code.videoapi.sdk.VideoAPIActivity;
import code.videoapi.sdk.VideoAPIActivityDelegate;
import code.videoapi.sdk.VideoAPIActivityInterface;
import code.videoapi.sdk.VideoAPIConferenceOptions;
import code.videoapi.sdk.VideoAPIView;
import code.videoapi.sdk.VideoAPIViewListener;
import code.videoapi.sdk.log.VideoAPILogger;

public class ConfActivity extends FragmentActivity implements VideoAPIActivityInterface, VideoAPIViewListener {
    private static final String ACTION_VIDEOAPI_CONFERENCE = "code.TEST.CONFERENCE";
    private static final String VIDEOAPI_CONFERENCE_OPTIONS = "VideoAPIConferenceOptions";

    private VideoAPIView room;
    public static void launch(Context context, VideoAPIConferenceOptions options) {
        Intent intent = new Intent(context, ConfActivity.class);
        intent.setAction(ACTION_VIDEOAPI_CONFERENCE);
        intent.putExtra(VIDEOAPI_CONFERENCE_OPTIONS, options);
        context.startActivity(intent);
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);

        VideoAPIActivityDelegate.onNewIntent(intent);
    }

    @Override
    protected void onResume() {
        super.onResume();


        Intent intent = getIntent();
        VideoAPIConferenceOptions options;

        if ((options = getOptions(intent)) != null) {
            room.join(options);
            return;
        }

    }



    @Override
    public void requestPermissions(String[] permissions, int requestCode, PermissionListener listener) {
        VideoAPIActivityDelegate.requestPermissions(this, permissions, requestCode, listener);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        VideoAPIActivityDelegate.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_conf);

        FrameLayout videoView = (FrameLayout) findViewById(R.id.room);

        room = new VideoAPIView(this);
        android.graphics.Rect size = new Rect();
        android.graphics.Rect toolbarContainerRect = new Rect();


        room.setListener(this);

        this.getWindowManager().getDefaultDisplay().getRectSize(size);
        videoView.addView(room, size.width(), size.height());


    }


    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    @Override
    public void finish() {
        room.leave();

        super.finish();
    }




    @Override
    public void onParticipantLeft(Map<String, Object> data) {
        VideoAPILogger.i("APP: left " + data);

    }
    @Override
    public void onParticipantJoined(Map<String, Object> data) {
        VideoAPILogger.i("APP: join " + data);
    }

    @Override
    public void onConferenceJoined(Map<String, Object> data) {
        VideoAPILogger.i("APP: conf join " + data);

    }


    @Override
    public void onConferenceTerminated(Map<String, Object> map) {
        finish();

    }

    @Override
    public void onConferenceWillJoin(Map<String, Object> data) {
        VideoAPILogger.i("APP: conf will join " + data);

    }

    @Override
    public void onRaiseHandUpdated(Map<String, Object> data) {
        VideoAPILogger.i("APP: raise hand " );

    }

    private @Nullable
    VideoAPIConferenceOptions getOptions(Intent intent) {
        String action = intent.getAction();

        if (ACTION_VIDEOAPI_CONFERENCE.equals(action)) {
            return intent.getParcelableExtra(VIDEOAPI_CONFERENCE_OPTIONS);
        }

        return null;
    }


}
