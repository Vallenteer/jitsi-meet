// @flow

import React, { useCallback, useState } from 'react';

import { Icon, IconArrowUp, IconCheck } from '../../../base/icons';
import IconView from '../../../base/icons/videoapi/view.png';
import { getParticipantCount } from '../../../base/participants';
import { connect } from '../../../base/redux';
import { ToolboxButtonWithIcon } from '../../../base/toolbox/components';
import { setFullScreen } from '../../../toolbox/actions.web';
import ToolbarButton from '../../../toolbox/components/web/ToolbarButton';
import { toggleTileView } from '../../../video-layout';

import InlineDialog from './InlineDialog';


type Props = {

   /**
    * Component's children (the audio button).
    */
    children: React$Node,

   /**
    * Flag controlling the visibility of the popup.
    */
    isOpen: boolean,

   /**
    * Callback executed when the popup closes.
    */
    onClose: Function,
}

/**
 * Popup with audio settings.
 *
 * @returns {ReactElement}
 */
function ViewPopup({
    dispatch,
    fullScreen,
    lonelyMeeting,
    onClose,
    t,
    tileViewEnabled
}: Props) {
    const [ isOpen, setIsOpen ] = useState(false);

    const onFullscreenClick = useCallback(() => {
        dispatch(setFullScreen(!fullScreen));
    }, [setFullScreen, dispatch, fullScreen ]);

    const onSpeakerViewClick = useCallback(() => {
        if (tileViewEnabled) {
            dispatch(toggleTileView());
        }
    }, [tileViewEnabled, toggleTileView, dispatch ]);

    const onGalleryViewClick = useCallback(() => {
        if (!tileViewEnabled) {
            dispatch(toggleTileView());
        }
    }, [tileViewEnabled, toggleTileView, dispatch ]);

    return (
        <div className = 'view-popup'>
            <InlineDialog
                content = { <ul className = 'overflow-menu'>
                    <li
                        className = 'overflow-menu-item'
                        key = 'fullscreen'
                        onClick = { onFullscreenClick }>
                        <div className = 'overflow-menu-item-icon'>
                            { fullScreen && <Icon src = { IconCheck } /> }
                        </div>
                        <div className = 'overflow-menu-item-text'>
                            {t('toolboxTitle.fullscreen')}
                        </div>
                    </li>
                    { !lonelyMeeting && (
                        <>
                            <li
                                className = 'overflow-menu-item'
                                key = 'speaker'
                                onClick = { onSpeakerViewClick }>
                                <div className = 'overflow-menu-item-icon'>
                                    { !tileViewEnabled && <Icon src = { IconCheck } /> }
                                </div>
                                <div className = 'overflow-menu-item-text'>
                                    {t('toolboxTitle.speakerView')}
                                </div>
                            </li>
                            <li
                                className = 'overflow-menu-item'
                                key = 'gallery'
                                onClick = { onGalleryViewClick }>
                                <div className = 'overflow-menu-item-icon'>
                                    { tileViewEnabled && <Icon src = { IconCheck } /> }
                                </div>
                                <div className = 'overflow-menu-item-text'>
                                    {t('toolboxTitle.galleryView')}
                                </div>
                            </li>
                        </>
                    )}
                </ul> }
                isOpen = { isOpen }
                onClose = { () => setIsOpen(false) }
                position = 'top left'>
                <ToolboxButtonWithIcon
                    title = { t('toolboxTitle.view') }
                    icon = { IconArrowUp }
                    onIconClick = { () => setIsOpen(!isOpen) }>
                    <ToolbarButton
                        empty = { true }
                        iconImage = { IconView }
                        onClick = { () => setIsOpen(!isOpen) }
                    />
                </ToolboxButtonWithIcon>
            </InlineDialog>
        </div>
    );
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @returns {Object}
 */
function mapStateToProps(state) {
    const {
        fullScreen
    } = state['features/toolbox'];
    const { tileViewEnabled } = state['features/video-layout'];
    const lonelyMeeting = getParticipantCount(state) < 2;


    return {
        fullScreen,
        lonelyMeeting,
        tileViewEnabled
    };
}


export default connect(mapStateToProps)(ViewPopup);
