import { DEVICES_LIST_UPDATED, VIDEOAPI_SHOW_MODAL_DIALOG, VIDEOAPI_SHOW_PARTICIPANT_LIST } from "./actionTypes";

export function devicesListUpdated(devicesList) {
    return {
        type: DEVICES_LIST_UPDATED,
        devicesList
    };
}

export function showModalDialog(isOpen) {
    return {
        type: VIDEOAPI_SHOW_MODAL_DIALOG,
        isOpen
    };
}

export function showParticipantList(isParticipantListOpen) {
    return {
        type: VIDEOAPI_SHOW_PARTICIPANT_LIST,
        isParticipantListOpen
    };
}

export function showMoreDialog(isMoreDialogOpen) {
    return {
        type: VIDEOAPI_SHOW_MORE_DIALOG,
        isMoreDialogOpen
    };
}