// @flow

import React, { PureComponent } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Collapsible from 'react-native-collapsible';

import { ColorSchemeRegistry } from '../../../base/color-scheme';
import { BottomSheet, hideDialog, isDialogOpen } from '../../../base/dialog';
import { IconDragHandle, IconVideoQualityHD, IconVideoQualityLD } from '../../../base/icons';
import { connect } from '../../../base/redux';
import { StyleType } from '../../../base/styles';
import { SharedDocumentButton } from '../../../etherpad';
import { InviteButton } from '../../../invite';
import { LobbyModeButton } from '../../../lobby/components/native';
import { AudioRouteButton } from '../../../mobile/audio-mode';
import { LiveStreamButton, RecordButton } from '../../../recording';
import { RoomLockButton } from '../../../room-lock';
import { ClosedCaptionButton } from '../../../subtitles';
import { TileViewButton } from '../../../video-layout';
import { VideoShareButton } from '../../../youtube-player/components';
import HelpButton from '../HelpButton';
import MuteEveryoneButton from '../MuteEveryoneButton';

import AudioOnlyButton from './AudioOnlyButton';
import MoreOptionsButton from './MoreOptionsButton';
import RaiseHandButton from './RaiseHandButton';
import ScreenSharingButton from './ScreenSharingButton.js';
import ToggleCameraButton from './ToggleCameraButton';
import styles from './styles';
import VideoQualityButton from './VideoQualityButton';
import { VideoQualityDialog } from '../../../video-quality';
import { VIDEO_QUALITY_LEVELS } from '../../../video-quality/constants';
import { getCurrentPreferredVideoQuality } from '../../../videoapi/api';
import { getFeatureFlag, TOOLBAR_BUTTONS } from '../../../base/flags';

/**
 * The type of the React {@code Component} props of {@link OverflowMenu}.
 */
type Props = {

    /**
     * The color-schemed stylesheet of the dialog feature.
     */
    _bottomSheetStyles: StyleType,

    /**
     * True if the overflow menu is currently visible, false otherwise.
     */
    _isOpen: boolean,

    /**
     * Whether the recoding button should be enabled or not.
     */
    _recordingEnabled: boolean,

    /**
     * Used for hiding the dialog when the selection was completed.
     */
    dispatch: Function
};

type State = {

    /**
     * True if the bottom scheet is scrolled to the top.
     */
    scrolledToTop: boolean,

    /**
     * True if the 'more' button set needas to be rendered.
     */
    showMore: boolean,

    showVideoQuality: boolean,
    videoQualityIcon: Object,
}

/**
 * The exported React {@code Component}. We need it to execute
 * {@link hideDialog}.
 *
 * XXX It does not break our coding style rule to not utilize globals for state,
 * because it is merely another name for {@code export}'s {@code default}.
 */
let OverflowMenu_; // eslint-disable-line prefer-const

/**
 * Implements a React {@code Component} with some extra actions in addition to
 * those in the toolbar.
 */
class OverflowMenu extends PureComponent<Props, State> {
    /**
     * Initializes a new {@code OverflowMenu} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            scrolledToTop: true,
            showMore: false,
            showVideoQuality: false,
            videoQualityIcon: IconVideoQualityLD
        };

        // Bind event handlers so they are only bound once per instance.
        this._onCancel = this._onCancel.bind(this);
        this._onSwipe = this._onSwipe.bind(this);
        this._onToggleMenu = this._onToggleMenu.bind(this);
        this._onVideoQuality = this._onVideoQuality.bind(this);

        this._renderMenuExpandToggle = this._renderMenuExpandToggle.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _bottomSheetStyles } = this.props;
        const { showMore, showVideoQuality, videoQualityIcon } = this.state;

        const buttonProps = {
            afterClick: this._onCancel,
            showLabel: true,
            styles: _bottomSheetStyles.buttons
        };

        const moreOptionsButtonProps = {
            ...buttonProps,
            afterClick: this._onToggleMenu,
            visible: !showMore
        };

        const videoQualityMenuOptionsButtonProps = {
            ...buttonProps,
            afterClick: this._onVideoQuality,
            visible: !showVideoQuality
        };

        const videoQualityOptionsButtonProps = {
            ...buttonProps,
            afterClick: this._onVideoQuality
        };

        const hasMuteEveryone = this.props.toolbarButtons.indexOf('mute-everyone') >= 0;
        const hasTileView = this.props.toolbarButtons.indexOf('tileview') >= 0;
        const hasInvite = this.props.toolbarButtons.indexOf('invite') >= 0;

        return (
            <BottomSheet
                onCancel = { this._onCancel }
                onSwipe = { this._onSwipe }
                renderHeader = { this._renderMenuExpandToggle }>
                <AudioRouteButton { ...buttonProps } />
                { hasInvite && <InviteButton { ...buttonProps } /> }
                <VideoQualityButton
                    icon = { videoQualityIcon }
                    isMenu = { true }
                    { ...videoQualityMenuOptionsButtonProps } />
                <Collapsible collapsed = { !showVideoQuality }>
                    <VideoQualityButton quality = { VIDEO_QUALITY_LEVELS.LOW }  { ...videoQualityOptionsButtonProps }/>
                    <VideoQualityButton quality = { VIDEO_QUALITY_LEVELS.STANDARD } { ...videoQualityOptionsButtonProps } />
                    <VideoQualityButton quality = { VIDEO_QUALITY_LEVELS.HIGH } { ...videoQualityOptionsButtonProps } />
                </Collapsible>
                <AudioOnlyButton { ...buttonProps } />
                <LobbyModeButton { ...buttonProps } />
                <ToggleCameraButton { ...buttonProps } />
                { hasTileView && <TileViewButton { ...buttonProps } /> }
                <MoreOptionsButton { ...moreOptionsButtonProps } />
                <Collapsible collapsed = { !showMore }>
                    <RecordButton { ...buttonProps } />
                    <RoomLockButton { ...buttonProps } />
                    <ClosedCaptionButton { ...buttonProps } />
                    <SharedDocumentButton { ...buttonProps } />
                    { hasMuteEveryone && <MuteEveryoneButton { ...buttonProps } /> }
                    <HelpButton { ...buttonProps } />
                </Collapsible>
            </BottomSheet>
        );
    }

    _renderMenuExpandToggle: () => React$Element<any>;

    /**
     * Function to render the menu toggle in the bottom sheet header area.
     *
     * @returns {React$Element}
     */
    _renderMenuExpandToggle() {
        return (
            <View
                style = { [
                    this.props._bottomSheetStyles.sheet,
                    styles.expandMenuContainer
                ] }>
                <TouchableOpacity onPress = { this._onToggleMenu }>
                    { /* $FlowFixMeProps */ }
                    <IconDragHandle style = { this.props._bottomSheetStyles.expandIcon } />
                </TouchableOpacity>
            </View>
        );
    }

    _onCancel: () => boolean;

    /**
     * Hides this {@code OverflowMenu}.
     *
     * @private
     * @returns {boolean}
     */
    _onCancel() {
        if (this.props._isOpen) {
            this.props.dispatch(hideDialog(OverflowMenu_));

            return true;
        }

        return false;
    }

    _onSwipe: string => void;

    /**
     * Callback to be invoked when swipe gesture is detected on the menu. Returns true
     * if the swipe gesture is handled by the menu, false otherwise.
     *
     * @param {string} direction - Direction of 'up' or 'down'.
     * @returns {boolean}
     */
    _onSwipe(direction) {
        const { showMore } = this.state;

        switch (direction) {
        case 'up':
            !showMore && this.setState({
                showMore: true
            });

            return !showMore;
        case 'down':
            showMore && this.setState({
                showMore: false
            });

            return showMore;
        }
    }

    _onToggleMenu: () => void;

    /**
     * Callback to be invoked when the expand menu button is pressed.
     *
     * @returns {void}
     */
    _onToggleMenu() {
        this.setState({
            showMore: !this.state.showMore
        });
    }

    _onVideoQuality: () => void;

    /**
     * Callback to be invoked when the video quality menu button is pressed.
     *
     * @returns {void}
     */
    _onVideoQuality() {
        let icon = IconVideoQualityHD;
        switch (getCurrentPreferredVideoQuality()) {
            case VIDEO_QUALITY_LEVELS.LOW:
                icon = IconVideoQualityLD;
                break
            case VIDEO_QUALITY_LEVELS.STANDARD:
                icon = IconVideoQualitySD;
                break
            case VIDEO_QUALITY_LEVELS.HIGH:
            default:
                icon = IconVideoQualityHD;
                break
            }

        this.setState({
            videoQualityIcon: icon,
            showVideoQuality: !this.state.showVideoQuality
        });
    }
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    return {
        _bottomSheetStyles: ColorSchemeRegistry.get(state, 'BottomSheet'),
        _isOpen: isDialogOpen(state, OverflowMenu_),
        toolbarButtons: getFeatureFlag(state, TOOLBAR_BUTTONS,
            '')
    };
}

OverflowMenu_ = connect(_mapStateToProps)(OverflowMenu);

export default OverflowMenu_;
