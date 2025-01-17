// @flow

import React, { Component } from 'react';

import { isMobileBrowser } from '../../../base/environment/utils';
import { translate } from '../../../base/i18n';
import { IconArrowUp } from '../../../base/icons';
import { IconImageMic, IconImageMicOff } from '../../../base/icons/videoapi';
import LibVideoAPI from '../../../base/lib-jitsi-meet/_';
import { isAudioMuted } from '../../../base/media';
import { connect } from '../../../base/redux';
import { ToolboxButtonWithIcon } from '../../../base/toolbox/components';
import { getMediaPermissionPromptVisibility } from '../../../overlay';
import { AudioSettingsPopup, toggleAudioMuteness, toggleAudioSettings } from '../../../settings';
import { isAudioSettingsButtonDisabled } from '../../functions';
import AudioMuteButton from '../AudioMuteButton';

import ToolbarButton from './ToolbarButton';

type Props = {

    /**
     * Click handler for the small icon. Opens audio options.
     */
    onAudioOptionsClick: Function,

    /**
     * Whether the permission prompt is visible or not.
     * Useful for enabling the button on permission grant.
     */
    permissionPromptVisibility: boolean,

    /**
     * If the button should be disabled.
     */
    isDisabled: boolean,

    /**
     * Flag controlling the visibility of the button.
     * AudioSettings popup is disabled on mobile browsers.
     */
    visible: boolean,
};

type State = {

    /**
     * If there are permissions for audio devices.
     */
    hasPermissions: boolean,
}

/**
 * Button used for audio & audio settings.
 *
 * @returns {ReactElement}
 */
class AudioSettingsButton extends Component<Props, State> {
    _isMounted: boolean;

    /**
     * Initializes a new {@code AudioSettingsButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._isMounted = true;
        this.state = {
            hasPermissions: false
        };
    }

    /**
     * Updates device permissions.
     *
     * @returns {Promise<void>}
     */
    async _updatePermissions() {
        const hasPermissions = await LibVideoAPI.mediaDevices.isDevicePermissionGranted(
            'audio',
        );

        this._isMounted && this.setState({
            hasPermissions
        });
    }

    /**
     * Implements React's {@link Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._updatePermissions();
    }

    /**
     * Implements React's {@link Component#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (this.props.permissionPromptVisibility !== prevProps.permissionPromptVisibility) {
            this._updatePermissions();
        }
    }

    /**
     * Implements React's {@link Component#componentWillUnmount}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._isMounted = false;
    }

    /**
     * Implements React's {@link Component#render}.
     *
     * @inheritdoc
     */
    render() {
        const { dispatch, muted, isDisabled, onAudioOptionsClick, onAudioMuteClick, visible, t } = this.props;
        const settingsDisabled = !this.state.hasPermissions
            || isDisabled
            || !LibVideoAPI.mediaDevices.isMultipleAudioInputSupported();

        return  (
            <AudioSettingsPopup>
                <ToolboxButtonWithIcon
                    icon = { IconArrowUp }
                    iconDisabled = { settingsDisabled }
                    onIconClick = { onAudioOptionsClick }
                    title = { muted ? t('toolboxTitle.unmute') : t('toolboxTitle.mute') }>
                    <ToolbarButton
                        empty = { true }
                        iconImage = { muted ? IconImageMicOff : IconImageMic }
                        onClick = { onAudioMuteClick }
                    />
                </ToolboxButtonWithIcon>
            </AudioSettingsPopup>
        )
    }
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        muted: isAudioMuted(state),
        isDisabled: isAudioSettingsButtonDisabled(state),
        permissionPromptVisibility: getMediaPermissionPromptVisibility(state),
        visible: !isMobileBrowser()
    };
}

const mapDispatchToProps = {
    onAudioOptionsClick: toggleAudioSettings,
    onAudioMuteClick: toggleAudioMuteness
};

export default translate(connect(
    mapStateToProps,
    mapDispatchToProps,
)(AudioSettingsButton));
