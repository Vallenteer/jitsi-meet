// @flow

import React from 'react';
import { openDialog } from '../../../base/dialog';

import { translate } from '../../../base/i18n';
import { StopRecordingDialog } from '../Recording';
import { JitsiRecordingConstants } from '../../../base/lib-jitsi-meet';
import { connect } from '../../../base/redux';
import { getLocalParticipant, PARTICIPANT_ROLE } from '../../../base/participants';
import AbstractRecordingLabel, {
    _mapStateToProps
} from '../AbstractRecordingLabel';
import { IconRemoteControlStop } from '../../../base/icons';
import { Icon } from '../../../base/icons';

/**
 * Implements a React {@link Component} which displays the current state of
 * conference recording.
 *
 * @extends {Component}
 */
class RecordingLabel extends AbstractRecordingLabel {
    /**
     * Renders the platform specific label component.
     *
     * @inheritdoc
     */
    //xxx
    _renderLabel() {
        if (this.props._status !== JitsiRecordingConstants.status.ON) {
            // Since there are no expanded labels on web, we only render this
            // label when the recording status is ON.
            //return null;
        }
        const participantStyle = this.props._isModerator && this.props._status === 'on' ? '' : 'participant';
        return (
            <div className="videoapi-recording-indicator">
                <div 
                    className={ `text ${participantStyle}` }
                    style= {{
                        borderRadius: participantStyle !== '' ? '7px 7px 7px 7px' : '7px 0 0 7px'
                    }}>
                        { this.props.t(this._getLabelKey()) }
                </div>
                { this.props._isModerator && this.props._status === 'on' && (
                <div className="button"
                onClick = { () => {
                    this.props.dispatch(openDialog(StopRecordingDialog));
                }}
                >
                    <Icon 
                        src={ IconRemoteControlStop } 
                        size={12} />
                </div>
                )} 
            </div>
        );
    }

    _getLabelKey: () => ?string
}

function _myMapStateToProps(state, ownProps: Prop) {
    const localParticipant = getLocalParticipant(state);
    return {
        ..._mapStateToProps(state, ownProps),
        _iAmRecorder: state['features/base/config'].iAmRecorder,
        _isModerator: localParticipant.role === PARTICIPANT_ROLE.MODERATOR

    };
}

export default translate(connect(_myMapStateToProps)(RecordingLabel));

