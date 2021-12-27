import { NativeEventEmitter, NativeModules } from 'react-native';
import LibVideoAPI from '../base/lib-jitsi-meet';
import { APP_WILL_MOUNT, APP_WILL_UNMOUNT } from '../base/app';
import { setAudioMuted, setVideoMuted } from '../base/media';
import { getLocalParticipant, participantUpdated } from '../base/participants';
import { MiddlewareRegistry } from '../base/redux';
import { processExternalDeviceRequest } from '../device-selection/functions';
import { devicesListUpdated } from './actions';

import { _SET_VIDEOAPI_BRIDGE_SUBSCRIPTIONS } from './actionTypes';
import { Commands } from './commands';

const bridge = new NativeEventEmitter(NativeModules.VideoAPICommandBridge);

MiddlewareRegistry.register(store => next => action => {
    /* eslint-disable no-fallthrough */
    switch (action.type) {
    case APP_WILL_UNMOUNT: {
        store.dispatch({
            type: _SET_VIDEOAPI_BRIDGE_SUBSCRIPTIONS,
            subscriptions: undefined
        });
        break;
    }
    case APP_WILL_MOUNT:
        _appWillMount(store);

    /* eslint-enable no-fallthrough */
    }

    return next(action);
});

/**
 * Notifies this feature that the action {@link APP_WILL_MOUNT} is being
 * dispatched within a specific redux {@code store}.
 *
 * @param {Store} store - The redux store in which the specified {@code action}
 * is being dispatched.
 * @private
 * @returns {void}
 */
function _appWillMount(store) {
    console.log('xxx reg')
    const subscriptions = [
        bridge.addListener(Commands.GET_DEVICES_LIST, (event)=>{

            console.log('xxx getdevicesList');
            navigator.mediaDevices.getUserMedia({audio:{}, video:{}}).then(_ => {
                navigator.mediaDevices.enumerateDevices()
                .then(devices => {
                    const filtered = devices.filter(device => device.kind === type);

                    store.dispatch(devicesListUpdated(devices));
                });
            });
        }, store),
        bridge.addListener(Commands.TOGGLE_AUDIO, _ => {
            const { getState } = store;
            const { muted } = getState()['features/base/media'].audio;

            store.dispatch(setAudioMuted(!muted));
        }, store),
        bridge.addListener(Commands.TOGGLE_VIDEO, _ => {
            const { getState } = store;
            const { muted } = getState()['features/base/media'].video;

            store.dispatch(setVideoMuted(!muted));
        }, store),
        bridge.addListener(Commands.TOGGLE_RAISE_HAND, event => {
            const _localParticipant = getLocalParticipant(store);


            store.dispatch(participantUpdated({
                id: _localParticipant.id,
                local: true,
                raisedHand: event['handRaised']
            }));
        }, store)
    ];

    store.dispatch({
        type: _SET_VIDEOAPI_BRIDGE_SUBSCRIPTIONS,
        subscriptions
    });
}

