// @flow

import React, { useState } from 'react';
import { setFollowMe, setStartMutedPolicy } from '../../../base/conference';

import { Dialog, hideDialog } from '../../../base/dialog';
import { i18next, translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import {
    DeviceSelection,
    getDeviceSelectionDialogProps,
    submitDeviceSelectionTab
} from '../../../device-selection';
import { getMoreTabProps } from '../../functions';

import MoreTab from './MoreTab';

declare var APP: Object;
declare var interfaceConfig: Object;

/**
 * A React {@code Component} for displaying a dialog to modify local settings
 * and conference-wide (moderator) settings. This version is connected to
 * redux to get the current settings.
 *
 * @extends Component
 */
const SettingsDialog = ({
    _deviceSelectionProps,
    _moreTabProps,
    dispatch,
    t
}: Props) => {

    const [ state, setState ] = useState({..._moreTabProps})

    const onChange = props => {
        setState({...state, ...props});
    }

    const onSubmit = () => {
        if (_moreTabProps.followMeEnabled !== state.followMeEnabled) {
            dispatch(setFollowMe(state.followMeEnabled));
        }

        if (state.startAudioMuted !== _moreTabProps.startAudioMuted
            || state.startVideoMuted !== _moreTabProps.startVideoMuted) {
            dispatch(setStartMutedPolicy(
                state.startAudioMuted, state.startVideoMuted));
        }

        if (state.currentLanguage !== _moreTabProps.currentLanguage) {
            i18next.changeLanguage(state.currentLanguage);
        }

        dispatch(submitDeviceSelectionTab(state));

        return true;
    }


    return (
        <Dialog
            closeDialog = { () => dispatch(hideDialog()) }
            cssClassName = 'settings-dialog'
            okKey = 'videoapi.title.save'
            onSubmit = { onSubmit }
            titleKey = 'settings.title' >
            <div
                className = 'settings-sub-pane'
                key = 'devices'>
                <div className = 'settings-entry'>
                    { t('settings.devices') }
                </div>
                <DeviceSelection parentOnChange = { onChange } { ..._deviceSelectionProps } />
            </div>
            <MoreTab
                parentOnChange = { onChange }
                { ...state } />
        </Dialog>
    );
};

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code ConnectedSettingsDialog} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     tabs: Array<Object>
 * }}
 */
function _mapStateToProps(state) {
    const moreTabProps = getMoreTabProps(state);

    return {
        _deviceSelectionProps: getDeviceSelectionDialogProps(state),
        _moreTabProps: moreTabProps
    };
}
export default translate(connect(_mapStateToProps)(SettingsDialog));
