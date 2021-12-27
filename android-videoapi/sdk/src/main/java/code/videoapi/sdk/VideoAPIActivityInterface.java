package code.videoapi.sdk;

import androidx.core.app.ActivityCompat;

import com.facebook.react.modules.core.PermissionAwareActivity;

/**
 * This interface serves as the umbrella interface that applications not using
 * {@code VideoAPIFragment} must implement in order to ensure full
 * functionality.
 */
public interface VideoAPIActivityInterface
    extends ActivityCompat.OnRequestPermissionsResultCallback,
            PermissionAwareActivity {
}
