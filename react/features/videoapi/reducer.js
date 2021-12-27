// @flow

import { set, ReducerRegistry, StateListenerRegistry } from '../base/redux';
import { showModalDialog } from './actions';

import { _SET_VIDEOAPI_BRIDGE_SUBSCRIPTIONS, VIDEOAPI_SHOW_MODAL_DIALOG, VIDEOAPI_SHOW_PARTICIPANT_LIST, VIDEOAPI_SHOW_MORE_DIALOG } from './actionTypes';


const DEFAULT_BRIDGE_STATE = {
    subscriptions: []
};

const DEFAULT_DIALOG_STATE = {
    isOpen: false,
    isParticipantListOpen: false
};


ReducerRegistry.register('features/videoapi/bridge', (state = DEFAULT_BRIDGE_STATE, action) => {
    switch (action.type) {
    case _SET_VIDEOAPI_BRIDGE_SUBSCRIPTIONS:
        return set(state, 'subscriptions', action.subscriptions);
    }

    return state;
});

ReducerRegistry.register('features/videoapi/modal-dialog', (state = DEFAULT_DIALOG_STATE, action) => {
    switch (action.type) {
    case VIDEOAPI_SHOW_MODAL_DIALOG:
        return set(state, 'isOpen', action.isOpen);

    case VIDEOAPI_SHOW_PARTICIPANT_LIST:
        return set(state, 'isParticipantListOpen', action.isParticipantListOpen);

    case VIDEOAPI_SHOW_MORE_DIALOG:
        return set(state, 'isMoreDialogOpen', action.isMoreDialogOpen);

    }

    return state;
});

/**
 * Listens for changes in the chat state to calculate the dimensions of the tile view grid and the tiles.
 */
StateListenerRegistry.register(
    /* selector */ state => state['features/base/dialog'].component,
    /* listener */ (component, store) => {
        if (component === undefined) {
            store.dispatch(showModalDialog(false));
        }
    });
