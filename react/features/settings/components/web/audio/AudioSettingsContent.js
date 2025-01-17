// @flow

import React, { Component } from 'react';

import { translate } from '../../../../base/i18n';
import { IconMicrophoneEmpty, IconVolumeEmpty } from '../../../../base/icons';
import { isAudioMuted } from '../../../../base/media';
import { connect, equals } from '../../../../base/redux';
import { muteLocal } from '../../../../remote-video-menu/actions';
import { openSettingsDialog } from '../../../actions';
import { createLocalAudioTracks } from '../../../functions';

import AudioSettingsEntry from './AudioSettingsEntry';
import AudioSettingsHeader from './AudioSettingsHeader';
import MicrophoneEntry from './MicrophoneEntry';
import SpeakerEntry from './SpeakerEntry';

export type Props = {

   /**
    * The deviceId of the microphone in use.
    */
    currentMicDeviceId: string,

   /**
    * The deviceId of the output device in use.
    */
    currentOutputDeviceId: string,

   /**
    * Used to set a new microphone as the current one.
    */
    setAudioInputDevice: Function,

   /**
    * Used to set a new output device as the current one.
    */
    setAudioOutputDevice: Function,

   /**
    * A list of objects containing the labels and deviceIds
    * of all the output devices.
    */
    outputDevices: Object[],

   /**
    * A list with objects containing the labels and deviceIds
    * of all the input devices.
    */
    microphoneDevices: Object[],

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,

    isAudioMuted: Boolean
};

type State = {

   /**
    * An list of objects, each containing the microphone label, audio track, device id
    * and track error if the case.
    */
    audioTracks: Object[]
}

/**
 * Implements a React {@link Component} which displayes a list of all
 * the audio input & output devices to choose from.
 *
 * @extends Component
 */
class AudioSettingsContent extends Component<Props, State> {
    _componentWasUnmounted: boolean;

    /**
     * Initializes a new {@code AudioSettingsContent} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onMicrophoneEntryClick = this._onMicrophoneEntryClick.bind(this);
        this._onSpeakerEntryClick = this._onSpeakerEntryClick.bind(this);

        this.state = {
            audioTracks: props.microphoneDevices.map(({ deviceId, label }) => {
                return {
                    deviceId,
                    hasError: false,
                    jitsiTrack: null,
                    label
                };
            }),
            isMicShown: false,
            isSpeakerShown: false
        };
    }

    _onMicrophoneEntryClick: (string) => void;

    /**
     * Click handler for the microphone entries.
     *
     * @param {string} deviceId - The deviceId for the clicked microphone.
     * @returns {void}
     */
    _onMicrophoneEntryClick(deviceId) {
        this.props.setAudioInputDevice(deviceId);
    }

    _onSpeakerEntryClick: (string) => void;

    /**
     * Click handler for the speaker entries.
     *
     * @param {string} deviceId - The deviceId for the clicked speaker.
     * @returns {void}
     */
    _onSpeakerEntryClick(deviceId) {
        this.props.setAudioOutputDevice(deviceId);
    }

    /**
     * Renders a single microphone entry.
     *
     * @param {Object} data - An object with the deviceId, jitsiTrack & label of the microphone.
     * @param {number} index - The index of the element, used for creating a key.
     * @returns {React$Node}
     */
    _renderMicrophoneEntry(data, index) {
        const { deviceId, label, jitsiTrack, hasError } = data;
        const isSelected = deviceId === this.props.currentMicDeviceId;

        return (
            <MicrophoneEntry
                deviceId = { deviceId }
                hasError = { hasError }
                isSelected = { isSelected }
                jitsiTrack = { jitsiTrack }
                key = { `me-${index}` }
                onClick = { this._onMicrophoneEntryClick }>
                {label}
            </MicrophoneEntry>
        );
    }

    /**
     * Renders a single speaker entry.
     *
     * @param {Object} data - An object with the deviceId and label of the speaker.
     * @param {number} index - The index of the element, used for creating a key.
     * @returns {React$Node}
     */
    _renderSpeakerEntry(data, index) {
        const { deviceId, label } = data;
        const key = `se-${index}`;

        return (
            <SpeakerEntry
                deviceId = { deviceId }
                isSelected = { deviceId === this.props.currentOutputDeviceId }
                key = { key }
                onClick = { this._onSpeakerEntryClick }>
                {label}
            </SpeakerEntry>
        );
    }

    /**
     * Creates and updates the audio tracks.
     *
     * @returns {void}
     */
    async _setTracks() {
        this._disposeTracks(this.state.audioTracks);

        const audioTracks = await createLocalAudioTracks(
            this.props.microphoneDevices
        );

        if (this._componentWasUnmounted) {
            this._disposeTracks(audioTracks);
        } else {
            this.setState({
                audioTracks
            });
        }
    }

    /**
     * Disposes the audio tracks.
     *
     * @param {Object} audioTracks - The object holding the audio tracks.
     * @returns {void}
     */
    _disposeTracks(audioTracks) {
        audioTracks.forEach(({ jitsiTrack }) => {
            jitsiTrack && jitsiTrack.dispose();
        });
    }

    /**
     * Implements React's {@link Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._setTracks();
    }

    /**
     * Implements React's {@link Component#componentWillUnmount}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._componentWasUnmounted = true;
        this._disposeTracks(this.state.audioTracks);
    }

    /**
     * Implements React's {@link Component#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (!equals(this.props.microphoneDevices, prevProps.microphoneDevices)) {
            this._setTracks();
        }
    }

    toggleSubmenu(submenu) {
        const { isMicShown, isSpeakerShown } = this.state;

        if (submenu === 'mic') {
            this.setState({
                isMicShown: !isMicShown,
                isSpeakerShown: !isMicShown ? false : isSpeakerShown
            });
        }
        if (submenu === 'speaker') {
            this.setState({
                isMicShown: !isSpeakerShown ? false : isMicShown,
                isSpeakerShown: !isSpeakerShown
            });
        }
    }

    /**
     * Implements React's {@link Component#render}.
     *
     * @inheritdoc
     */
    render() {
        const { dispatch, onClose, outputDevices, t } = this.props;
        const { isMicShown, isSpeakerShown } = this.state;

        return (
            <div className = 'videoapi-popup-surface videoapi-toolbar-audio-button'>
                <li className = 'overflow-menu'>
                    <AudioSettingsHeader
                        key = 'mic'
                        IconComponent = { IconMicrophoneEmpty }
                        onClick = { () => this.toggleSubmenu('mic') }
                        text = { t('toolboxTitle.select-mic') } />
                    { isMicShown && this.state.audioTracks.map((data, i) =>
                        this._renderMicrophoneEntry(data, i),
                    )}
                    <AudioSettingsHeader
                        key = 'speaker'
                        IconComponent = { IconVolumeEmpty }
                        onClick = { () => this.toggleSubmenu('speaker') }
                        text = { t('toolboxTitle.select-speaker') } />
                    { isSpeakerShown && outputDevices.map((data, i) =>
                        this._renderSpeakerEntry(data, i),
                    )}
                    <AudioSettingsHeader
                        key = 'settings'
                        onClick = { () => {
                            dispatch(openSettingsDialog());
                            if (onClose) {
                                onClose();
                            }
                        }
                        }
                        text = { t('toolboxTitle.audioSettings') } />
                </li>
            </div>
        );
    }
}


/**
 * Maps (parts of) the redux state to {@link Toolbox}'s React {@code Component}
 * props.
 *
 * @param {Object} state - The redux store/state.
 * @private
 * @returns {{}}
 */
function _mapStateToProps(state) {
    return {
        _isAudioMuted: isAudioMuted(state)
    };
}

export default translate(connect(_mapStateToProps)(AudioSettingsContent));
