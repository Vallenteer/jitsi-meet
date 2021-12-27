// @flow

import { VIDEOAPI_RESIZE_LAYOUT } from '../videoapi/actionTypes';
import { TOGGLE_CHAT } from './actionTypes';

export * from './actions.any';

/**
 * Toggles display of the chat side panel while also taking window
 * resize into account.
 *
 * @returns {Function}
 */
export function toggleChat() {
    return function(dispatch: (Object) => Object) {
        dispatch({ type: TOGGLE_CHAT });
        document.dispatchEvent(new CustomEvent('videoapi-refresh-layout'));
//xxx
    };
}
