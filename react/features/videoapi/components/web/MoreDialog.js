import React, { useEffect, useState } from 'react';
import { IconImageAUDDark, IconImageHDDark, IconImageLDDark, IconImageMeDark, IconImageSDDark } from '../../../../../../src/icons';
import { getCurrentConference } from '../../../base/conference';

import { Dialog, openDialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { IconImageHelpDark, IconImageSecurityDark, IconImageSpeakerStatsDark } from '../../../base/icons/videoapi';
import {
    getLocalParticipant} from '../../../base/participants';
import { connect } from '../../../base/redux';
import { OverflowMenuItem } from '../../../base/toolbox/components';
import { RecordButton } from '../../../recording';
import { toggleSecurityDialog } from '../../../security';
import { SettingsButton } from '../../../settings';
import { SpeakerStats } from '../../../speaker-stats';
import MuteEveryoneButton from '../../../toolbox/components/MuteEveryoneButton';
import { VideoQualityDialog } from '../../../video-quality';
import { VIDEO_QUALITY_LEVELS } from '../../../video-quality/constants';
import { showMoreDialog } from '../../actions';
import { getCurrentPreferredVideoQuality } from '../../api';
import MeDialog from './MeDialog';


/**
 * Implements a React {@link Component} which displays Me component.
 *
 * @returns {ReactElement}
 */
function MoreDialog({
    audioOnly,
    conference,
    dispatch,
    visibleButtons,
    t
}: Props) {

    /**
     * Returns if a button name has been explicitly configured to be displayed.
     *
     * @param {string} buttonName - The name of the button, as expected in
     * {@link interfaceConfig}.
     * @private
     * @returns {boolean} True if the button should be displayed.
     */
    const shouldShowButton = buttonName => visibleButtons && visibleButtons.has(buttonName);
    const [ icon, setIcon ] = useState();

    const close = () => {
        dispatch(showMoreDialog(false));
    }

    useEffect(() => {
        let icon = IconImageHDDark;
        switch (getCurrentPreferredVideoQuality()) {
            case VIDEO_QUALITY_LEVELS.LOW:
                icon = IconImageLDDark;
                break
            case VIDEO_QUALITY_LEVELS.STANDARD:
                icon = IconImageSDDark;
                break
            default:
                icon = IconImageHDDark;
                break
            }

        if (audioOnly) {
            icon = IconImageAUDDark;
        }
        setIcon(icon);
    }, []);

    return (
        <Dialog
            hideButtons = { true }
            okKey = 'dialog.save'
            onClose = { close }
            titleKey = 'videoapi.title.more'
            width = 'small'>

            <ul className = 'overflow-menu'>
                { shouldShowButton('me')
                    && <OverflowMenuItem
                        accessibilityLabel =
                            { t('toolboxTitle.me') }
                        iconImage = { IconImageMeDark }
                        key = 'me'
                        onClick = { () => {
                            dispatch(openDialog(MeDialog));
                        } }
                        text = {
                            t('toolboxTitle.me')
                        } /> }

                { shouldShowButton('security')
                && <OverflowMenuItem
                    accessibilityLabel =
                        { t('toolbar.accessibilityLabel.security') }
                    iconImage = { IconImageSecurityDark }
                    key = 'security'
                    onClick = { () => {
                        dispatch(toggleSecurityDialog())
                    } }
                    text = {
                        t('toolbar.security')
                    } /> }

                { shouldShowButton('videoquality')
                    && <OverflowMenuItem
                        accessibilityLabel = { t('toolboxTitle.videoQuality') }
                        iconImage = { icon }
                        key = 'video-quality'
                        onClick = { () => {
                            dispatch(openDialog(VideoQualityDialog));
                        } }
                        text = { t('toolboxTitle.videoQuality') } /> }

                { <RecordButton
                    key = 'record'
                    isInOverflowMenu = { true }
                    showLabel = { true } /> }


                { shouldShowButton('settings')
                    && <SettingsButton
                        key = 'settings'
                        alignItems = 'start'
                        isInOverflowMenu = { true }
                        margin = ' '
                        useTooltip = { false }

                        showLabel = { true } /> }
                { shouldShowButton('mute-everyone')
                    && <MuteEveryoneButton
                        alignItems = 'start'
                        isInOverflowMenu = { true }
                        margin = ' '
                        key = 'mute-everyone'
                        useTooltip = { false }
                        showLabel = { true } /> }
                { shouldShowButton('stats')
                    && <OverflowMenuItem
                        accessibilityLabel = { t('toolbar.accessibilityLabel.speakerStats') }
                        iconImage = { IconImageSpeakerStatsDark }
                        key = 'stats'
                        onClick = { () => {
                            dispatch(openDialog(SpeakerStats, {
                                conference
                            }))
                        }}
                        text = { t('toolbar.speakerStats') } /> }
                { shouldShowButton('help')
                    && <OverflowMenuItem
                        accessibilityLabel = { t('toolbar.accessibilityLabel.help') }
                        iconImage = { IconImageHelpDark }
                        key = 'help'
                        onClick = { () => {} }
                        text = { t('toolbar.help') } /> }
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
    const localParticipant = getLocalParticipant(state) || {};
    const conference = getCurrentConference(state);

    const buttons = new Set(interfaceConfig.TOOLBAR_BUTTONS);

    return {
        audioOnly: state['features/base/audio-only'].enabled,
        conference,
        localParticipantID: localParticipant.id,
        raisedHand: localParticipant.raisedHand,
        visibleButtons: buttons
    };
}


export default translate(connect(mapStateToProps)(MoreDialog));
