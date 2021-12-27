import React, { useEffect, useRef, useState } from 'react';

import { DISPLAY_NAME_CHANGED, TRACK_MUTE_CHANGED, USER_JOINED, USER_LEFT, USER_ROLE_CHANGED } from '../../../../../../lib-jitsi-meet/VideoAPIConferenceEvents';
import { Avatar } from '../../../base/avatar';
import { getCurrentConference } from '../../../base/conference';
import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { IconImage } from '../../../base/icons';
import { IconImageCam, IconImageCamOff, IconImageMic, IconImageMicOff } from '../../../base/icons/videoapi';
import { getLocalParticipant } from '../../../base/participants';
import { connect } from '../../../base/redux';
import { showParticipantList } from '../../actions';

/**
 * Implements a React {@link Component} which displays participant entry.
 *
 * @returns {ReactElement}
 */
function ParticipantListEntry({
    conference,
    entry,
    isLocal,
    t
}: Props) {
    const displayName = entry.name || entry._displayName;
    const role = entry.role || entry._role;
    const emptyTitle = isLocal ? t('videoapi.title.me') : t('videoapi.title.guest');
    const tracks = isLocal ? conference ? conference.getLocalTracks() : [] : entry._tracks;

    return (
        <div className = 'videoapi-participant-list-entry'>
            <div className = 'videoapi-participant-list-entry-avatar'>
                <Avatar
                    participantId = { entry.id || entry._id }
                    size = { 30 } />
            </div>
            <div className = 'videoapi-participant-list-entry-title'>{ displayName || emptyTitle }{ role === 'moderator' ? ` (${t('videoapi.title.host')})` : ''}</div>
            <div className = 'videoapi-participant-list-entry-tracks'>
                { tracks && tracks.map(item => {
                    const isMuted = item.isMuted();

                    return (
                        <div
                            key = { item.ssrc }>
                            { item.type === 'audio' && (
                                <>
                                    { isMuted
                                        ? <IconImage src = { IconImageMicOff } />
                                        : <IconImage src = { IconImageMic } />
                                    }
                                </>
                            )}
                            { item.type === 'video' && (
                                <>
                                    { isMuted
                                        ? <IconImage src = { IconImageCamOff } />
                                        : <IconImage src = { IconImageCam } />
                                    }
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>);
}

/**
 * Implements a React {@link Component} which displays Me component.
 *
 * @returns {ReactElement}
 */
function ParticipantListDialog({
    conference,
    dispatch,
    isChatOpen,
    localParticipant,
    onClose,
    t
}: Props) {

    const [ participantList, setParticipantList ] = useState([]);

    const updateList = () => {
        if (conference) {
            const list = conference.getParticipants();

            setParticipantList(list);
        }
    };

    const close = () => {
        dispatch(showParticipantList(false));
    }

    useEffect(() => {
        if (!conference) {
            return () => {};
        }

        dispatch(showParticipantList(true));
        updateList();
        conference.on(USER_ROLE_CHANGED, updateList);
        conference.on(USER_LEFT, updateList);
        conference.on(USER_JOINED, updateList);
        conference.on(DISPLAY_NAME_CHANGED, updateList);
        conference.on(TRACK_MUTE_CHANGED, updateList);

        return () => {
            conference.off(USER_ROLE_CHANGED, updateList);
            conference.off(USER_LEFT, updateList);
            conference.off(USER_JOINED, updateList);
            conference.off(DISPLAY_NAME_CHANGED, updateList);
            conference.off(TRACK_MUTE_CHANGED, updateList);
        };
    }, [ conference ]);

    return (
        <Dialog
            childrenStyle = { isChatOpen ? 'split-mode' : 'single-mode' }
            hideButtons = { true }
            okKey = 'dialog.save'
            onClose = { close }
            titleKey = 'videoapi.title.participantList'
            width = 'small'>
            <ul className = 'videoapi-participant-list'>
                <ParticipantListEntry
                    conference = { conference }
                    entry = { localParticipant }
                    isLocal = { true }
                    key = { localParticipant.id }
                    t = { t } />
                { participantList.map(item => (
                    <ParticipantListEntry
                        conference = { conference }
                        entry = { item }
                        key = { item._id }
                        t = { t } />
                )) }
            </ul>
        </Dialog>
    );
}


/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @returns {Object}
 */
function mapStateToProps(state) {
    const conference = getCurrentConference(state);
    const localParticipant = getLocalParticipant(state);
    const isChatOpen = state['features/chat'].isOpen;

    return {
        conference,
        isChatOpen,
        localParticipant,
        state
    };
}


export default translate(connect(mapStateToProps)(ParticipantListDialog));
