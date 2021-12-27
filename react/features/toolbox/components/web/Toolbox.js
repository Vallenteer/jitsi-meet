// @flow

import React, { Component } from 'react';

import { IconImageParticipants, IconImageSharescreen } from '../../../../../../src/icons';
import {
    ACTION_SHORTCUT_TRIGGERED,
    createShortcutEvent,
    createToolbarEvent,
    sendAnalytics
} from '../../../analytics';
import { hideDialog, openDialog, toggleDialog } from '../../../base/dialog';
import { isMobileBrowser } from '../../../base/environment/utils';
import { translate } from '../../../base/i18n';
import {
    IconChat,
    IconInviteMore,
    IconRaisedHand,

} from '../../../base/icons';
import {
    IconImageRaiseHand,
    IconImageChat,
    IconImageMore
} from '../../../base/icons/videoapi';
import LibVideoAPI from '../../../base/lib-jitsi-meet';
import {
    getLocalParticipant,
    getParticipants,
    participantUpdated
} from '../../../base/participants';
import { connect, equals } from '../../../base/redux';
import { OverflowMenuItem } from '../../../base/toolbox/components';
import { getLocalVideoTrack, toggleScreensharing } from '../../../base/tracks';
import { CHAT_SIZE, ChatCounter, toggleChat } from '../../../chat';
import { EmbedMeetingDialog } from '../../../embed-meeting';
import { openFeedbackDialog } from '../../../feedback';
import { beginAddPeople } from '../../../invite';
import { openKeyboardShortcutsDialog } from '../../../keyboard-shortcuts';

import { SecurityDialogButton } from '../../../security';
import { toggleSecurityDialog } from '../../../security/actions';
import {
    SETTINGS_TABS,
    openSettingsDialog
} from '../../../settings';
import { toggleSharedVideo } from '../../../shared-video';
import { SpeakerStats } from '../../../speaker-stats';

import {
    TileViewButton,
    shouldDisplayTileView,
    toggleTileView
} from '../../../video-layout';


import CameraPopup from '../../../videoapi/components/web/CameraPopup';
import MoreDialog from '../../../videoapi/components/web/MoreDialog';
import ParticipantListDialog from '../../../videoapi/components/web/ParticipantListDialog';
import ViewPopup from '../../../videoapi/components/web/ViewPopup';
import {
    setFullScreen,
    setOverflowMenuVisible,
    setToolbarHovered,
    setOverflowMenuHangupVisible
} from '../../actions';
import { isToolboxVisible } from '../../functions';
import HangupButton from '../HangupButton';

import AudioSettingsButton from './AudioSettingsButton';
import OverflowMenuButton from './OverflowMenuButton';
import ToolbarButton from './ToolbarButton';
/**
 * The type of the React {@code Component} props of {@link Toolbox}.
 */
type Props = {

    /**
     * Whether or not the chat feature is currently displayed.
     */
    _modalDialogOpen: boolean,

    /**
     * The {@code JitsiConference} for the current conference.
     */
    _conference: Object,

    /**
     * The tooltip key to use when screensharing is disabled. Or undefined
     * if non to be shown and the button to be hidden.
     */
    _desktopSharingDisabledTooltipKey: boolean,

    /**
     * Whether or not screensharing is initialized.
     */
    _desktopSharingEnabled: boolean,

    /**
     * Whether or not a dialog is displayed.
     */
    _dialog: boolean,

    /**
     * Whether or not call feedback can be sent.
     */
    _feedbackConfigured: boolean,

    /**
     * Whether or not the app is currently in full screen.
     */
    _fullScreen: boolean,

    /**
     * Whether or not the profile is disabled.
     */
    _isProfileDisabled: boolean,

    /**
     * Whether or not the tile view is enabled.
     */
    _tileViewEnabled: boolean,


    /**
     * The ID of the local participant.
     */
    _localParticipantID: String,

    /**
     * The value for how the conference is locked (or undefined if not locked)
     * as defined by room-lock constants.
     */
    _locked: boolean,

    /**
     * Whether or not the overflow menu is visible.
     */
    _overflowMenuVisible: boolean,

    /**
     * Whether or not the local participant's hand is raised.
     */
    _raisedHand: boolean,

    /**
     * Whether or not the local participant is screensharing.
     */
    _screensharing: boolean,

    /**
     * Whether or not the local participant is sharing a YouTube video.
     */
    _sharingVideo: boolean,

    /**
     * Flag showing whether toolbar is visible.
     */
    _visible: boolean,

    /**
     * Set with the buttons which this Toolbox should display.
     */
    _visibleButtons: Set<string>,

    /**
     * Invoked to active other features of the app.
     */
    dispatch: Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,

    /**
     * Whether or not the overflow hangup is visible.
     */
    _overflowMenuHangupVisible: boolean,
};


declare var APP: Object;
declare var interfaceConfig: Object;

// XXX: We are not currently using state here, but in the future, when
// interfaceConfig is part of redux we will. This will have to be retrieved from the store.
const visibleButtons = new Set(interfaceConfig.TOOLBAR_BUTTONS);

/**
 * Implements the conference toolbox on React/Web.
 *
 * @extends Component
 */
class Toolbox extends Component<Props, State> {
    /**
     * Initializes a new {@code Toolbox} instance.
     *
     * @param {Props} props - The read-only React {@code Component} props with
     * which the new instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onMouseOut = this._onMouseOut.bind(this);
        this._onMouseOver = this._onMouseOver.bind(this);
        this._onResize = this._onResize.bind(this);
        this._onSetOverflowVisible = this._onSetOverflowVisible.bind(this);
        this._onSetOverflowHangupVisible = this._onSetOverflowHangupVisible.bind(this);

        this._onShortcutToggleChat = this._onShortcutToggleChat.bind(this);
        this._onShortcutToggleFullScreen = this._onShortcutToggleFullScreen.bind(this);
        this._onShortcutToggleRaiseHand = this._onShortcutToggleRaiseHand.bind(this);
        this._onShortcutToggleScreenshare = this._onShortcutToggleScreenshare.bind(this);
        this._onShortcutToggleVideoQuality = this._onShortcutToggleVideoQuality.bind(this);
        this._onToolbarOpenFeedback = this._onToolbarOpenFeedback.bind(this);
        this._onToolbarOpenInvite = this._onToolbarOpenInvite.bind(this);
        this._onToolbarOpenKeyboardShortcuts = this._onToolbarOpenKeyboardShortcuts.bind(this);
        this._onToolbarOpenSpeakerStats = this._onToolbarOpenSpeakerStats.bind(this);
        this._onToolbarOpenEmbedMeeting = this._onToolbarOpenEmbedMeeting.bind(this);
        this._onToolbarOpenVideoQuality = this._onToolbarOpenVideoQuality.bind(this);
        this._onToolbarOpenSecurityDialog = this._onToolbarOpenSecurityDialog.bind(this);
        this._onToolbarToggleChat = this._onToolbarToggleChat.bind(this);
        this._onToolbarToggleFullScreen = this._onToolbarToggleFullScreen.bind(this);
        this._onToolbarParticipantList = this._onToolbarParticipantList.bind(this);
        this._onToolbarShowMore = this._onToolbarShowMore.bind(this);
        this._onToolbarToggleProfile = this._onToolbarToggleProfile.bind(this);
        this._onToolbarToggleRaiseHand = this._onToolbarToggleRaiseHand.bind(this);
        this._onToolbarToggleScreenshare = this._onToolbarToggleScreenshare.bind(this);
        this._onToolbarToggleSharedVideo = this._onToolbarToggleSharedVideo.bind(this);
        this._onShortcutToggleTileView = this._onShortcutToggleTileView.bind(this);

        this.state = {
            windowWidth: window.innerWidth
        };
    }

    /**
     * Sets keyboard shortcuts for to trigger ToolbarButtons actions.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        const KEYBOARD_SHORTCUTS = [
            this._shouldShowButton('videoquality') && {
                character: 'A',
                exec: this._onShortcutToggleVideoQuality,
                helpDescription: 'keyboardShortcuts.videoQuality'
            },
            this._shouldShowButton('chat') && {
                character: 'C',
                exec: this._onShortcutToggleChat,
                helpDescription: 'keyboardShortcuts.toggleChat'
            },
            this._shouldShowButton('desktop') && {
                character: 'D',
                exec: this._onShortcutToggleScreenshare,
                helpDescription: 'keyboardShortcuts.toggleScreensharing'
            },
            this._shouldShowButton('raisehand') && {
                character: 'R',
                exec: this._onShortcutToggleRaiseHand,
                helpDescription: 'keyboardShortcuts.raiseHand'
            },
            this._shouldShowButton('fullscreen') && {
                character: 'S',
                exec: this._onShortcutToggleFullScreen,
                helpDescription: 'keyboardShortcuts.fullScreen'
            },
            this._shouldShowButton('tileview') && {
                character: 'W',
                exec: this._onShortcutToggleTileView,
                helpDescription: 'toolbar.tileViewToggle'
            }
        ];

        KEYBOARD_SHORTCUTS.forEach(shortcut => {
            if (typeof shortcut === 'object') {
                APP.keyboardshortcut.registerShortcut(
                    shortcut.character,
                    null,
                    shortcut.exec,
                    shortcut.helpDescription);
            }
        });

        window.addEventListener('resize', this._onResize);
    }

    /**
     * Update the visibility of the {@code OverflowMenuButton}.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        // Ensure the dialog is closed when the toolbox becomes hidden.
        if (prevProps._overflowMenuVisible && !this.props._visible) {
            this._onSetOverflowVisible(false);
        }

        if (prevProps._overflowMenuVisible
            && !prevProps._dialog
            && this.props._dialog) {
            this._onSetOverflowVisible(false);
            this.props.dispatch(setToolbarHovered(false));
        }

        if (this.props._modalDialogOpen !== prevProps._modalDialogOpen) {
            this._onResize();
        }
    }

    /**
     * Removes keyboard shortcuts registered by this component.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        [ 'A', 'C', 'D', 'R', 'S' ].forEach(letter =>
            APP.keyboardshortcut.unregisterShortcut(letter));

        window.removeEventListener('resize', this._onResize);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _needShift, _visible, _visibleButtons } = this.props;
        const rootClassNames = `new-toolbox ${_visible ? 'visible' : ''} ${
            _visibleButtons.size ? '' : 'no-buttons'} ${_needShift ? 'shift-left' : ''}`;

        return (
            <div
                className = { rootClassNames }
                id = 'new-toolbox'
                onMouseOut = { this._onMouseOut }
                onMouseOver = { this._onMouseOver }>
                <div className = 'toolbox-background' />
                { this._renderToolboxContent() }
            </div>
        );
    }

    /**
     * Callback invoked to display {@code FeedbackDialog}.
     *
     * @private
     * @returns {void}
     */
    _doOpenFeedback() {
        const { _conference } = this.props;

        this.props.dispatch(openFeedbackDialog(_conference));
    }

    /**
     * Callback invoked to display {@code FeedbackDialog}.
     *
     * @private
     * @returns {void}
     */
    _doOpenEmbedMeeting() {
        this.props.dispatch(openDialog(EmbedMeetingDialog));
    }

    /**
     * Dispatches an action to display {@code KeyboardShortcuts}.
     *
     * @private
     * @returns {void}
     */
    _doOpenKeyboardShorcuts() {
        this.props.dispatch(openKeyboardShortcutsDialog());
    }

    /**
     * Callback invoked to display {@code SpeakerStats}.
     *
     * @private
     * @returns {void}
     */
    _doOpenSpeakerStats() {
        this.props.dispatch(openDialog(SpeakerStats, {
            conference: this.props._conference
        }));
    }

    /**
     * Dispatches an action to open the video quality dialog.
     *
     * @private
     * @returns {void}
     */
    _doOpenVideoQuality() {
        this.props.dispatch(openDialog(VideoQualityDialog));
    }

    /**
     * Dispatches an action to open the More dialog.
     *
     * @private
     * @returns {void}
     */
    _doOpenMoreDialog() {
        if (this.props._chatOpen) {
            this.props.dispatch(toggleChat());
        }
        this.props.dispatch(toggleDialog(MoreDialog));
    }

    /**
     * Dispatches an action to open the Me dialog.
     *
     * @private
     * @returns {void}
     */
    _doOpenParticipantListDialog() {
        this.props.dispatch(toggleDialog(ParticipantListDialog));
    }

    /**
     * Dispatches an action to toggle the display of chat.
     *
     * @private
     * @returns {void}
     */
    _doToggleChat() {
        this.props.dispatch(toggleChat());
        if (!this.props._isParticipantDialogOpen) {
            setTimeout(() => {
                this.props.dispatch(hideDialog());
            }, 500);
        }
    }

    /**
     * Dispatches an action to toggle screensharing.
     *
     * @private
     * @returns {void}
     */
    _doToggleFullScreen() {
        const fullScreen = !this.props._fullScreen;

        this.props.dispatch(setFullScreen(fullScreen));
    }

    /**
     * Dispatches an action to show or hide the profile edit panel.
     *
     * @private
     * @returns {void}
     */
    _doToggleProfile() {
        this.props.dispatch(openSettingsDialog(SETTINGS_TABS.PROFILE));
    }

    /**
     * Dispatches an action to toggle the local participant's raised hand state.
     *
     * @private
     * @returns {void}
     */
    _doToggleRaiseHand() {
        const { _localParticipantID, _raisedHand } = this.props;

        this.props.dispatch(participantUpdated({
            // XXX Only the local participant is allowed to update without
            // stating the JitsiConference instance (i.e. participant property
            // `conference` for a remote participant) because the local
            // participant is uniquely identified by the very fact that there is
            // only one local participant.

            id: _localParticipantID,
            local: true,
            raisedHand: !_raisedHand
        }));
    }

    /**
     * Dispatches an action to toggle screensharing.
     *
     * @private
     * @returns {void}
     */
    _doToggleScreenshare() {
        if (this.props._desktopSharingEnabled) {
            this.props.dispatch(toggleScreensharing());
        }
    }

    /**
     * Dispatches an action to toggle YouTube video sharing.
     *
     * @private
     * @returns {void}
     */
    _doToggleSharedVideo() {
        this.props.dispatch(toggleSharedVideo());
    }

    /**
     * Dispatches an action to toggle the video quality dialog.
     *
     * @private
     * @returns {void}
     */
    _doToggleVideoQuality() {
        this.props.dispatch(toggleDialog(VideoQualityDialog));
    }

    /**
     * Dispaches an action to toggle tile view.
     *
     * @private
     * @returns {void}
     */
    _doToggleTileView() {
        this.props.dispatch(toggleTileView());
    }

    _doToggleSecurity() {
        this.props.dispatch(toggleSecurityDialog());
    }

    _onMouseOut: () => void;

    /**
     * Dispatches an action signaling the toolbar is not being hovered.
     *
     * @private
     * @returns {void}
     */
    _onMouseOut() {
        this.props.dispatch(setToolbarHovered(false));
    }

    _onMouseOver: () => void;

    /**
     * Dispatches an action signaling the toolbar is being hovered.
     *
     * @private
     * @returns {void}
     */
    _onMouseOver() {
        this.props.dispatch(setToolbarHovered(true));
    }

    _onResize: () => void;

    /**
     * A window resize handler used to calculate the number of buttons we can
     * fit in the toolbar.
     *
     * @private
     * @returns {void}
     */
    _onResize() {
        let widthToUse = window.innerWidth;

        // Take chat size into account when resizing toolbox.
        if (this.props._modalDialogOpen) {
            widthToUse -= CHAT_SIZE;
        }

        if (this.state.windowWidth !== widthToUse) {
            this.setState({ windowWidth: widthToUse });
        }
    }


    _onSetOverflowVisible: (boolean) => void;

    _onSetOverflowHangupVisible: (boolean) => void;

    /**
     * Sets the visibility of the overflow menu.
     *
     * @param {boolean} visible - Whether or not the overflow menu should be
     * displayed.
     * @private
     * @returns {void}
     */
    _onSetOverflowVisible(visible) {
        this.props.dispatch(setOverflowMenuVisible(visible));
    }


    _onSetOverflowHangupVisible(visible) {
        this.props.dispatch(setOverflowMenuHangupVisible(visible));
    }
    _onShortcutToggleChat: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling the display of chat.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleChat() {
        sendAnalytics(createShortcutEvent(
            'toggle.chat',
            {
                enable: !this.props._modalDialogOpen
            }));

        this._doToggleChat();
    }

    _onShortcutToggleVideoQuality: () => void;

    /**
    * Creates an analytics keyboard shortcut event and dispatches an action for
    * toggling the display of Video Quality.
    *
    * @private
    * @returns {void}
    */
    _onShortcutToggleVideoQuality() {
        sendAnalytics(createShortcutEvent('video.quality'));

        this._doToggleVideoQuality();
    }

    _onShortcutToggleTileView: () => void;

    /**
     * Dispatches an action for toggling the tile view.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleTileView() {
        sendAnalytics(createShortcutEvent(
            'toggle.tileview',
            {
                enable: !this.props._tileViewEnabled
            }));

        this._doToggleTileView();
    }

    _onShortcutToggleFullScreen: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling full screen mode.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleFullScreen() {
        sendAnalytics(createShortcutEvent(
            'toggle.fullscreen',
            {
                enable: !this.props._fullScreen
            }));

        this._doToggleFullScreen();
    }

    _onShortcutToggleRaiseHand: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling raise hand.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleRaiseHand() {
        sendAnalytics(createShortcutEvent(
            'toggle.raise.hand',
            ACTION_SHORTCUT_TRIGGERED,
            { enable: !this.props._raisedHand }));

        this._doToggleRaiseHand();
    }

    _onShortcutToggleScreenshare: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling screensharing.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleScreenshare() {
        sendAnalytics(createToolbarEvent(
            'screen.sharing',
            {
                enable: !this.props._screensharing
            }));

        this._doToggleScreenshare();
    }

    _onToolbarOpenFeedback: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * display of feedback.
     *
     * @private
     * @returns {void}
     */
    _onToolbarOpenFeedback() {
        sendAnalytics(createToolbarEvent('feedback'));

        this._doOpenFeedback();
    }

    _onToolbarOpenInvite: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for opening
     * the modal for inviting people directly into the conference.
     *
     * @private
     * @returns {void}
     */
    _onToolbarOpenInvite() {
        sendAnalytics(createToolbarEvent('invite'));
        this.props.dispatch(beginAddPeople());
    }

    _onToolbarOpenKeyboardShortcuts: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for opening
     * the modal for showing available keyboard shortcuts.
     *
     * @private
     * @returns {void}
     */
    _onToolbarOpenKeyboardShortcuts() {
        sendAnalytics(createToolbarEvent('shortcuts'));

        this._doOpenKeyboardShorcuts();
    }

    _onToolbarOpenEmbedMeeting: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for opening
     * the embed meeting modal.
     *
     * @private
     * @returns {void}
     */
    _onToolbarOpenEmbedMeeting() {
        sendAnalytics(createToolbarEvent('embed.meeting'));

        this._doOpenEmbedMeeting();
    }

    _onToolbarOpenSpeakerStats: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for opening
     * the speaker stats modal.
     *
     * @private
     * @returns {void}
     */
    _onToolbarOpenSpeakerStats() {
        sendAnalytics(createToolbarEvent('speaker.stats'));

        this._doOpenSpeakerStats();
    }

    _onToolbarOpenVideoQuality: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * open the video quality dialog.
     *
     * @private
     * @returns {void}
     */
    _onToolbarOpenVideoQuality() {
        sendAnalytics(createToolbarEvent('video.quality'));

        this._doOpenVideoQuality();
    }

    _onToolbarToggleChat: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * the display of chat.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleChat() {
        sendAnalytics(createToolbarEvent(
            'toggle.chat',
            {
                enable: !this.props._modalDialogOpen
            }));

        this._doToggleChat();
    }

    _onToolbarToggleFullScreen: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * full screen mode.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleFullScreen() {
        sendAnalytics(createToolbarEvent(
            'toggle.fullscreen',
                {
                    enable: !this.props._fullScreen
                }));

        this._doToggleFullScreen();
    }

    _onToolbarOpenSecurityDialog: () => void;
    _onToolbarOpenSecurityDialog() {
        console.log('xxx --- ')
        this._doToggleSecurity();
    }

    _onToolbarShowMore: () => void;
    _onToolbarShowMore() {
        this._doOpenMoreDialog();
    }

    _onToolbarParticipantList: () => void;
    _onToolbarParticipantList() {

        this._doOpenParticipantListDialog();
    }

    _onToolbarToggleProfile: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for showing
     * or hiding the profile edit panel.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleProfile() {
        sendAnalytics(createToolbarEvent('profile'));

        this._doToggleProfile();
    }

    _onToolbarToggleRaiseHand: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * raise hand.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleRaiseHand() {
        sendAnalytics(createToolbarEvent(
            'raise.hand',
            { enable: !this.props._raisedHand }));

        this._doToggleRaiseHand();
    }

    _onToolbarToggleScreenshare: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * screensharing.
     *
     * @private
     * @returns {void}        SendAnalytics(createToolbarEvent('profile'));.

     */
    _onToolbarToggleScreenshare() {
        if (!this.props._desktopSharingEnabled) {
            return;
        }

        sendAnalytics(createShortcutEvent(
            'toggle.screen.sharing',
            ACTION_SHORTCUT_TRIGGERED,
            { enable: !this.props._screensharing }));

        this._doToggleScreenshare();
    }

    _onToolbarToggleSharedVideo: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * the sharing of a YouTube video.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleSharedVideo() {
        sendAnalytics(createToolbarEvent('shared.video.toggled',
            {
                enable: !this.props._sharingVideo
            }));

        this._doToggleSharedVideo();
    }


    /**
     * Returns true if the the desktop sharing button should be visible and
     * false otherwise.
     *
     * @returns {boolean}
     */
    _isDesktopSharingButtonVisible() {
        const {
            _desktopSharingEnabled,
            _desktopSharingDisabledTooltipKey
        } = this.props;

        return _desktopSharingEnabled || _desktopSharingDisabledTooltipKey;
    }

    /**
     * Renders a button for toggleing screen sharing.
     *
     * @private
     * @param {boolean} isInOverflowMenu - True if the button is moved to the
     * overflow menu.
     * @returns {ReactElement|null}
     */
    _renderDesktopSharingButton(isInOverflowMenu = false) {
        const {
            _desktopSharingEnabled,
            _desktopSharingDisabledTooltipKey,
            _screensharing,
            t
        } = this.props;

        if (!this._isDesktopSharingButtonVisible()) {
            return null;
        }

        if (isInOverflowMenu) {
            return (
                <OverflowMenuItem
                    accessibilityLabel
                        = { t('toolbar.accessibilityLabel.shareYourScreen') }
                    disabled = { _desktopSharingEnabled }
                    iconImage = { IconImageSharescreen }
                    iconId = 'share-desktop'
                    key = 'desktop'
                    onClick = { this._onToolbarToggleScreenshare }
                    text = {
                        t(`toolbar.${
                            _screensharing
                                ? 'stopScreenSharing' : 'startScreenSharing'}`
                        )
                    } />
            );
        }

        const tooltip = t(
            _desktopSharingEnabled
                ? 'dialog.shareYourScreen' : _desktopSharingDisabledTooltipKey);

        return (
            <ToolbarButton
                title = 'Share Screen'
                accessibilityLabel
                    = { t('toolbar.accessibilityLabel.shareYourScreen') }
                disabled = { !_desktopSharingEnabled }
                empty = { true }
                iconImage = { IconImageSharescreen }
                onClick = { this._onToolbarToggleScreenshare }
                toggled = { _screensharing }
                tooltip = { tooltip } />
        );
    }

    /**
     * Returns true if the profile button is visible and false otherwise.
     *
     * @returns {boolean}
     */
    _isEmbedMeetingVisible() {
        return this._shouldShowButton('embedmeeting');
    }

    /**
     * Returns true if the profile button is visible and false otherwise.
     *
     * @returns {boolean}
     */
    _isProfileVisible() {
        return !this.props._isProfileDisabled && this._shouldShowButton('profile');
    }



    _renderOverflowMenuHangup() {
        return [
            <HangupButton
                customClass = { 'overflowHangup' }
                overflow = { true }
                isInOverflowMenu = { true }
                showLabel = { true }
                title = 'Leave Meeting'
                icon = 'overflowHangup' />
        ];
    }

    /**
     * Renders a list of buttons that are moved to the overflow menu.
     *
     * @private
     * @param {Array<string>} movedButtons - The names of the buttons to be
     * moved.
     * @returns {Array<ReactElement>}
     */
    _renderMovedButtons(movedButtons) {
        const {
            _modalDialogOpen,
            _raisedHand,
            t
        } = this.props;

        return movedButtons.map(buttonName => {
            switch (buttonName) {
            case 'desktop':
                return this._renderDesktopSharingButton(true);
            case 'raisehand':
                return (
                    <OverflowMenuItem
                        accessibilityLabel =
                            { t('toolbar.accessibilityLabel.raiseHand') }
                        icon = { IconRaisedHand }
                        key = 'raisedHand'
                        onClick = { this._onToolbarToggleRaiseHand }
                        text = {
                            t(`toolbar.${
                                _raisedHand
                                    ? 'lowerYourHand' : 'raiseYourHand'}`
                            )
                        } />
                );
            case 'chat':
                return (
                    <OverflowMenuItem
                        accessibilityLabel =
                            { t('toolbar.accessibilityLabel.chat') }
                        icon = { IconChat }
                        key = 'chat'
                        onClick = { this._onToolbarToggleChat }
                        text = {
                            t(`toolbar.${
                                _modalDialogOpen ? 'closeChat' : 'openChat'}`
                            )
                        } />
                );

            case 'security':
                return (
                    <SecurityDialogButton
                        key = 'security'
                        showLabel = { true } />
                );
            case 'invite':
                return (
                    <OverflowMenuItem
                        accessibilityLabel = { t('toolbar.accessibilityLabel.invite') }
                        icon = { IconInviteMore }
                        key = 'invite'
                        onClick = { this._onToolbarOpenInvite }
                        text = { t('toolbar.invite') } />
                );
            case 'tileview':
                return <TileViewButton showLabel = { true } />;

            default:
                return null;
            }
        });
    }

    /**
     * Renders the Audio controlling button.
     *
     * @returns {ReactElement}
     */
    _renderAudioButton() {
        return this._shouldShowButton('microphone')
            ? <AudioSettingsButton
                key = 'asb'
                visible = { true } />
            : null;
    }

    /**
     * Renders the toolbox content.
     *
     * @returns {Array<ReactElement>}
     */
    _renderToolboxContent() {
        const {
            _modalDialogOpen,
            _raisedHand,
            t,
            _overflowMenuHangupVisible
        } = this.props;
        const overflowMenuHangup = this._renderOverflowMenuHangup();
        const toolbarAccLabel = 'toolbar.accessibilityLabel.moreActionsMenu';
        const buttonsLeft = [];
        const buttonsRight = [];

        const smallThreshold = 700;
        const verySmallThreshold = 500;

        let minSpaceBetweenButtons = 48;
        let widthPlusPaddingOfButton = 56;

        if (this.state.windowWidth <= verySmallThreshold && !isMobileBrowser()) {
            minSpaceBetweenButtons = 26;
            widthPlusPaddingOfButton = 28;
        } else if (this.state.windowWidth <= smallThreshold && !isMobileBrowser()) {
            minSpaceBetweenButtons = 36;
            widthPlusPaddingOfButton = 40;
        }

        const maxNumberOfButtonsPerGroup = Math.floor(
            (
                this.state.windowWidth
                    - 168 // the width of the central group by design
                    - minSpaceBetweenButtons // the minimum space between the button groups
            )
            / widthPlusPaddingOfButton // the width + padding of a button
            / 2 // divide by the number of groups(left and right group)
        );

        if (this._shouldShowButton('chat')) {
            buttonsLeft.push('chat');
        }
        if (this._shouldShowButton('desktop')
                && this._isDesktopSharingButtonVisible()) {
            buttonsLeft.push('desktop');
        }
        if (this._shouldShowButton('raisehand')) {
            buttonsLeft.push('raisehand');
        }

        if (this._shouldShowButton('invite')) {
            buttonsRight.push('invite');
        }


        const movedButtons = [];

        if (buttonsLeft.length > maxNumberOfButtonsPerGroup) {
            movedButtons.push(...buttonsLeft.splice(
                maxNumberOfButtonsPerGroup,
                buttonsLeft.length - maxNumberOfButtonsPerGroup));
            if (buttonsRight.indexOf('overflowmenu') === -1) {
                buttonsRight.unshift('overflowmenu');
            }
        }

        if (buttonsRight.length > maxNumberOfButtonsPerGroup) {
            if (buttonsRight.indexOf('overflowmenu') === -1) {
                buttonsRight.unshift('overflowmenu');
            }

            let numberOfButtons = maxNumberOfButtonsPerGroup;

            // make sure the more button will be displayed when we move buttons.
            if (numberOfButtons === 0) {
                numberOfButtons++;
            }

            movedButtons.push(...buttonsRight.splice(
                numberOfButtons,
                buttonsRight.length - numberOfButtons));

        }


        // new version
        this.toolboxButtons = {};
        this._shouldShowButton('fullscreen') && this.addButton('left',
            <ViewPopup
                t = { t }
                key = 'fullscreen'
                tooltip = { 'Full Screen' } />);

        this._shouldShowButton('raisehand') && this.addButton('left', (
            <ToolbarButton
                accessibilityLabel = { t('toolbar.accessibilityLabel.raiseHand') }
                className = 'raisehand-button-toolbar half-size'
                empty = { true }
                iconImage = { IconImageRaiseHand }
                onClick = { this._onToolbarToggleRaiseHand }
                title = {
                    t(`toolbar.${
                        _raisedHand
                            ? 'lowerYourHand' : 'raiseYourHand'}`
                    )
                }
                toggled = { _raisedHand }
                tooltip = { t('toolbar.raiseHand') } />));

        this.addButton('center', this._renderAudioButton());
        this._shouldShowButton('camera') && this.addButton('center',
            <CameraPopup
                t = { t }
                key = 'camera'
                tooltip = { 'Video off' } />);
        this._shouldShowButton('desktop') && this.addButton('center', this._renderDesktopSharingButton());

        this.addButton('center',
            <ToolbarButton
                empty = { true }
                iconImage = { IconImageParticipants }
                onClick = { this._onToolbarParticipantList }
                title = { t('toolboxTitle.participants') }
                tooltip = { 'toolboxTitle.participants' } />);

        this._shouldShowButton('chat') && this.addButton('center', (<div className = 'toolbar-button-with-badge'>
            <ToolbarButton
                accessibilityLabel = { t('toolbar.accessibilityLabel.chat') }
                empty = { true }
                iconImage = { IconImageChat }
                onClick = { this._onToolbarToggleChat }
                title = { t('toolboxTitle.chat') }
                toggled = { _modalDialogOpen }
                tooltip = { t('toolbar.chat') } />
            <ChatCounter />
        </div>));

        this.addButton('center', (
            <ToolbarButton
                accessibilityLabel = { t('toolboxTitle.more') }
                empty = { true }
                iconImage = { IconImageMore }
                onClick = { this._onToolbarShowMore }
                title = { t('toolboxTitle.more') }
                tooltip = { t('toolbar.more') } />
        ));


        this._shouldShowButton('hangup') && this.addButton('right', (
            <OverflowMenuButton
                classNameIcon = 'hangup-toolbar-button no-border'
                isOpen = { _overflowMenuHangupVisible }
                state = 'hangup'
                onVisibilityChange = { this._onSetOverflowHangupVisible }>
                <ul
                    aria-label = { t(toolbarAccLabel) }
                    className = 'overflow-menu'>
                    { overflowMenuHangup }
                </ul>
            </OverflowMenuButton>));

        if (this.state.windowWidth < 740) {
            return (
                <div className = 'toolbox-content'>
                    <div className = 'button-group-all'>
                        { this.getButtons('all') }
                    </div>
                </div>);
        }

        return (
            <div className = 'toolbox-content'>
                <div className = 'button-group-left'>
                    { this.getButtons('left') }
                </div>
                <div className = 'button-group-center'>
                    { this.getButtons('center') }
                </div>
                <div className = 'button-group-right'>
                    { this.getButtons('right') }
                </div>
            </div>);
    }

    /**
     * Adds a button to toolbox.
     *
     * @param {string} group - The button group.
     * @param {string} element - The button element.
     * @returns {undefined}
     * @private
     */
    addButton(group, element) {
        const toAdd = this.toolboxButtons[group] || [];

        toAdd.push(element);
        this.toolboxButtons[group] = toAdd;
    }

    /**
     * Gets a button group in a toolbox.
     *
     * @param {string} group - The button group.
     * @returns {any}
     * @private
     */
    getButtons(group) {
        if (group === 'all') {
            let ret = [];

            ret = this.getButtons('left');
            ret = ret.concat(this.getButtons('center'));
            ret = ret.concat(this.getButtons('right'));

            return ret;
        }
        const toGet = this.toolboxButtons[group] || [];

        return toGet;
    }

    _shouldShowButton: (string) => boolean;

     /**
     * Returns if a button name has been explicitly configured to be displayed.
     *
     * @param {string} buttonName - The name of the button, as expected in
     * {@link interfaceConfig}.
     * @private
     * @returns {boolean} True if the button should be displayed.
     */
    _shouldShowButton(buttonName) {
        return this.props._visibleButtons.has(buttonName);
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
    const { conference, locked } = state['features/base/conference'];
    let desktopSharingEnabled = LibVideoAPI.isDesktopSharingEnabled();
    const {
        callStatsID,
        enableFeaturesBasedOnToken
    } = state['features/base/config'];
    const sharedVideoStatus = state['features/shared-video'].status;
    const {
        fullScreen,
        overflowMenuVisible,
        overflowMenuHangupVisible
    } = state['features/toolbox'];
    const localParticipant = getLocalParticipant(state);
    const localParticipantID = localParticipant ? localParticipant.id : '';
    const raisedHand = localParticipant ? localParticipant.raisedHand : false;

    const localVideo = getLocalVideoTrack(state['features/base/tracks']);
    const _audioOnly = state['features/base/audio-only'].enabled;


    let desktopSharingDisabledTooltipKey;

    if (enableFeaturesBasedOnToken) {
        // we enable desktop sharing if any participant already have this
        // feature enabled
        desktopSharingEnabled = getParticipants(state)
            .find(({ features = {} }) =>
                String(features['screen-sharing']) === 'true') !== undefined;
        desktopSharingDisabledTooltipKey = 'dialog.shareYourScreenDisabled';
    }

    // NB: We compute the buttons again here because if URL parameters were used to
    // override them we'd miss it.
    const buttons = new Set(interfaceConfig.TOOLBAR_BUTTONS);
    const _chatOpen = state['features/chat'].isOpen;
    const _modalDialogOpen = state['features/videoapi/modal-dialog'].isOpen;
    const _isParticipantDialogOpen = state['features/videoapi/modal-dialog'].isParticipantListOpen;
    const _isMoreDialogOpen = state['features/videoapi/modal-dialog'].isMoreDialogOpen;

    const _needShift = _chatOpen || _modalDialogOpen;

    return {
        _chatOpen,
        _needShift,
        _modalDialogOpen,
        _isParticipantDialogOpen,
        _isMoreDialogOpen,
        _conference: conference,
        _desktopSharingEnabled: desktopSharingEnabled,
        _desktopSharingDisabledTooltipKey: desktopSharingDisabledTooltipKey,
        _dialog: Boolean(state['features/base/dialog'].component),
        _feedbackConfigured: Boolean(callStatsID),
        _isProfileDisabled: Boolean(state['features/base/config'].disableProfile),
        _fullScreen: fullScreen,
        _tileViewEnabled: shouldDisplayTileView(state),
        _localParticipantID: localParticipantID,
        _locked: locked,
        _overflowMenuVisible: overflowMenuVisible,
        _raisedHand: raisedHand,
        _screensharing: localVideo && localVideo.videoType === 'desktop',
        _sharingVideo: sharedVideoStatus === 'playing'
            || sharedVideoStatus === 'start'
            || sharedVideoStatus === 'pause',
        _visible: isToolboxVisible(state),
        _visibleButtons: equals(visibleButtons, buttons) ? visibleButtons : buttons,
        _audioOnly,
        _overflowMenuHangupVisible: overflowMenuHangupVisible
    };
}

export default translate(connect(_mapStateToProps)(Toolbox));
