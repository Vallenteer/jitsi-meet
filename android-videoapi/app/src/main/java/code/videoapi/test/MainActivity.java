package code.videoapi.test;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;

import androidx.appcompat.app.AppCompatActivity;

import code.videoapi.sdk.VideoAPI;
import code.videoapi.sdk.VideoAPIConferenceOptions;
import code.videoapi.sdk.log.VideoAPILogger;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        if (checkSelfPermission(Manifest.permission.INTERNET)
                == PackageManager.PERMISSION_DENIED) {
            requestPermissions(new String[] {Manifest.permission.INTERNET}, 1000);
        }
        if (checkSelfPermission(Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_DENIED) {
            requestPermissions(new String[] {Manifest.permission.CAMERA}, 2000);
        }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
                == PackageManager.PERMISSION_DENIED) {
            requestPermissions(new String[] {Manifest.permission.RECORD_AUDIO}, 3000);
        }
        if (checkSelfPermission(Manifest.permission.MODIFY_AUDIO_SETTINGS)
                == PackageManager.PERMISSION_DENIED) {
            requestPermissions(new String[] {Manifest.permission.MODIFY_AUDIO_SETTINGS}, 4000);
        }
        if (checkSelfPermission(Manifest.permission.ACCESS_NETWORK_STATE)
                == PackageManager.PERMISSION_DENIED) {
            requestPermissions(new String[] {Manifest.permission.ACCESS_NETWORK_STATE}, 5000);
        }
        if (checkSelfPermission(Manifest.permission.FOREGROUND_SERVICE)
                == PackageManager.PERMISSION_DENIED) {
            requestPermissions(new String[] {Manifest.permission.FOREGROUND_SERVICE}, 6000);
        }
        if (checkSelfPermission(Manifest.permission.MANAGE_OWN_CALLS)
                == PackageManager.PERMISSION_DENIED) {
            requestPermissions(new String[] {Manifest.permission.MANAGE_OWN_CALLS}, 7000);
        }
        if (checkSelfPermission(Manifest.permission.BLUETOOTH)
                == PackageManager.PERMISSION_DENIED) {
            requestPermissions(new String[] {Manifest.permission.BLUETOOTH}, 8000);
        }

        VideoAPIConferenceOptions defaultOptions
                = new VideoAPIConferenceOptions.Builder()
                .setAPIID("TEST")
                .setAPIKey("TEST")
                // Remove the comment to enable call buttons
                //.setFeatureFlag(VideoAPIConferenceOptions.TOOLBAR_BUTTONS, "microphone camera hangup chat settings raisehand videoquality")
                .build();
        VideoAPI.setDefaultConferenceOptions(defaultOptions);
        VideoAPILogger.i("APP: start ");

    }

    public void onButtonClick(View v) {
        EditText editText = findViewById(R.id.conferenceName);
        String text = editText.getText().toString();

        if (text.length() > 0) {
            // Build options object for joining the conference. The SDK will merge the default
            // one we set earlier and this one when joining.
            VideoAPIConferenceOptions options
                    = new VideoAPIConferenceOptions.Builder()
                    .setRoom(text)
                    .build();
            // Launch the new activity with the given options. The launch() method takes care
            // of creating the required Intent and passing the options.
            ConfActivity.launch(this, options);
        }
    }

}
