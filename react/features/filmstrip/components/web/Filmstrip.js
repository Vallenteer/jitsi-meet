/* @flow */

import _ from 'lodash';
import React, { Component } from 'react';
import type { Dispatch } from 'redux';

import {
    createShortcutEvent,
    createToolbarEvent,
    sendAnalytics
} from '../../../analytics';
import { isAnyDialogOpen } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { Icon, IconMenuDown, IconMenuUp } from '../../../base/icons';
import { getParticipantCount } from '../../../base/participants';
import { connect } from '../../../base/redux';
import { dockToolbox } from '../../../toolbox/actions.web';
import { getCurrentLayout, LAYOUTS } from '../../../video-layout';
import { setFilmstripHovered, setFilmstripVisible } from '../../actions';
import { shouldRemoteVideosBeVisible } from '../../functions';

declare var APP: Object;
declare var interfaceConfig: Object;

/**
 * The type of the React {@code Component} props of {@link Filmstrip}.
 */
type Props = {

    /**
     * Additional CSS class names top add to the root.
     */
    _className: string,

    /**
     * The current layout of the filmstrip.
     */
    _currentLayout: string,

    /**
     * The number of columns in tile view.
     */
    _columns: number,

    /**
     * The width of the filmstrip.
     */
    _filmstripWidth: number,

    /**
     * Whether the filmstrip scrollbar should be hidden or not.
     */
    _hideScrollbar: boolean,

    /**
     * Whether the filmstrip toolbar should be hidden or not.
     */
    _hideToolbar: boolean,

    /**
     * Whether or not remote videos are currently being hovered over. Hover
     * handling is currently being handled detected outside of react.
     */
    _hovered: boolean,

    /**
     * The number of rows in tile view.
     */
    _rows: number,

    /**
     * Additional CSS class names to add to the container of all the thumbnails.
     */
    _videosClassName: string,

    /**
     * Whether or not the filmstrip videos should currently be displayed.
     */
    _visible: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Dispatch<any>,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * Implements a React {@link Component} which represents the filmstrip on
 * Web/React.
 *
 * @extends Component
 */
class Filmstrip extends Component <Props> {
    _isHovered: boolean;

    _notifyOfHoveredStateUpdate: Function;

    _onMouseOut: Function;

    _onMouseOver: Function;
    _onScrollLeft: Function;
    _onScrollRight: Function;

    /**
     * Initializes a new {@code Filmstrip} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Debounce the method for dispatching the new filmstrip handled state
        // so that it does not get called with each mouse movement event. This
        // also works around an issue where mouseout and then a mouseover event
        // is fired when hovering over remote thumbnails, which are not yet in
        // react.
        this._notifyOfHoveredStateUpdate = _.debounce(this._notifyOfHoveredStateUpdate, 100);

        // Cache the current hovered state for _updateHoveredState to always
        // send the last known hovered state.
        this._isHovered = false;

        // Bind event handlers so they are only bound once for every instance.
        this._onMouseOut = this._onMouseOut.bind(this);
        this._onMouseOver = this._onMouseOver.bind(this);
        this._onScrollLeft = this._onScrollLeft.bind(this);
        this._onScrollRight = this._onScrollRight.bind(this);
        this._onShortcutToggleFilmstrip = this._onShortcutToggleFilmstrip.bind(this);
        this._onToolbarToggleFilmstrip = this._onToolbarToggleFilmstrip.bind(this);

    }

    /**
     * Implements React's {@link Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        APP.keyboardshortcut.registerShortcut(
            'F',
            'filmstripPopover',
            this._onShortcutToggleFilmstrip,
            'keyboardShortcuts.toggleFilmstrip'
        );
    }

    /**
     * Implements React's {@link Component#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        APP.keyboardshortcut.unregisterShortcut('F');
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        // Note: Appending of {@code RemoteVideo} views is handled through
        // VideoLayout. The views do not get blown away on render() because
        // ReactDOMComponent is only aware of the given JSX and not new appended
        // DOM. As such, when updateDOMProperties gets called, only attributes
        // will get updated without replacing the DOM. If the known DOM gets
        // modified, then the views will get blown away.

        const filmstripStyle = { };
        const filmstripRemoteVideosContainerStyle = {};
        let remoteVideoContainerClassName = 'remote-videos-container';
        let horizontal = '';

        switch (this.props._currentLayout) {
        case LAYOUTS.HORIZONTAL_FILMSTRIP_VIEW:
            remoteVideoContainerClassName += ' horizontal';
            horizontal = 'horizontal';
            break;

        case LAYOUTS.VERTICAL_FILMSTRIP_VIEW:
            // Adding 18px for the 2px margins, 2px borders on the left and right and 5px padding on the left and right.
            // Also adding 7px for the scrollbar.
            filmstripStyle.maxWidth = (interfaceConfig.FILM_STRIP_MAX_HEIGHT || 120) + 25;
            break;
        case LAYOUTS.TILE_VIEW: {
            // The size of the side margins for each tile as set in CSS.
            const { _columns, _rows, _filmstripWidth } = this.props;

            if (_rows > _columns) {
                remoteVideoContainerClassName += ' has-overflow';
            }

            filmstripRemoteVideosContainerStyle.width = _filmstripWidth;
            break;
        }
        }

        let remoteVideosWrapperClassName = 'filmstrip__videos';

        if (this.props._hideScrollbar) {
            remoteVideosWrapperClassName += ' hide-scrollbar';
        }

        const dualVideo = this.props._participantCount < 3 && horizontal === 'horizontal';
        const showScroll = this.props._participantCount > 5 && horizontal === 'horizontal';
        const tileViewDual = this.props._participantCount === 2 && horizontal !== 'horizontal';

        if (dualVideo) {
            remoteVideoContainerClassName += ' dual-video';
        }

        return (
            <div
                className = { `filmstrip ${this.props._className}` }
                style = { filmstripStyle }>
                <div
                    className = { `${this.props._videosClassName} ${horizontal} ${this.props._dialogOpen ? 'dialog-open' : ''}` }
                    id = 'remoteVideos'>
                    <div
                        className = { remoteVideosWrapperClassName }
                        id = 'filmstripRemoteVideos'>
                        {/*
                          * XXX This extra video container is needed for
                          * scrolling thumbnails in Firefox; otherwise, the flex
                          * thumbnails resize instead of causing overflow.
                          */}
                        { showScroll && <div className = 'scroll left' onClick = { this._onScrollLeft }></div> }

                        <div
                            className = { `${remoteVideoContainerClassName} ${ tileViewDual ? 'dual-video' : '' } ${this.props._dialogOpen ? 'dialog-open' : ''}` }
                            id = 'filmstripRemoteVideosContainer'
                            onMouseOut = { this._onMouseOut }
                            onMouseOver = { this._onMouseOver }
                            style = { filmstripRemoteVideosContainerStyle }>
                            <div
                                className = { `filmstrip__videos ${horizontal} ${ dualVideo ? 'dual-video' : '' } ` }
                                id = 'filmstripLocalVideo'
                                onMouseOut = { this._onMouseOut }
                                onMouseOver = { this._onMouseOver }>
                                <div id = 'filmstripLocalVideoThumbnail' />
                            </div>
                            <div id = 'localVideoTileViewContainer' />
                        </div>
                        { showScroll && <div className = 'scroll right' onClick = { this._onScrollRight }></div> }

                    </div>
                </div>
            </div>
        );
    }

    /**
     * Dispatches an action to change the visibility of the filmstrip.
     *
     * @private
     * @returns {void}
     */
    _doToggleFilmstrip() {
        this.props.dispatch(setFilmstripVisible(!this.props._visible));
    }

    _onScrollLeft() {
        const e = document.getElementById('filmstripRemoteVideosContainer');
        if (e) {
            // 4 is side margins
            e.scrollBy((this.props._horizontalViewDimensions.local.width + 4)* -1, 0);
        }
    }

    _onScrollRight() {
        const e = document.getElementById('filmstripRemoteVideosContainer');
        if (e) {
            e.scrollBy(this.props._horizontalViewDimensions.local.width + 4, 0);
        }
    }

    /**
     * If the current hover state does not match the known hover state in redux,
     * dispatch an action to update the known hover state in redux.
     *
     * @private
     * @returns {void}
     */
    _notifyOfHoveredStateUpdate() {
        if (this.props._hovered !== this._isHovered) {
            this.props.dispatch(dockToolbox(this._isHovered));
            this.props.dispatch(setFilmstripHovered(this._isHovered));
        }
    }

    /**
     * Updates the currently known mouseover state and attempt to dispatch an
     * update of the known hover state in redux.
     *
     * @private
     * @returns {void}
     */
    _onMouseOut() {
        this._isHovered = false;
        this._notifyOfHoveredStateUpdate();
    }

    /**
     * Updates the currently known mouseover state and attempt to dispatch an
     * update of the known hover state in redux.
     *
     * @private
     * @returns {void}
     */
    _onMouseOver() {
        this._isHovered = true;
        this._notifyOfHoveredStateUpdate();
    }

    _onShortcutToggleFilmstrip: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling filmstrip visibility.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleFilmstrip() {
        sendAnalytics(createShortcutEvent(
            'toggle.filmstrip',
            {
                enable: this.props._visible
            }));

        this._doToggleFilmstrip();
    }

    _onToolbarToggleFilmstrip: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for opening
     * the speaker stats modal.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleFilmstrip() {
        sendAnalytics(createToolbarEvent(
            'toggle.filmstrip.button',
            {
                enable: this.props._visible
            }));

        this._doToggleFilmstrip();
    }

    /**
     * Creates a React Element for changing the visibility of the filmstrip when
     * clicked.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderToggleButton() {
        const icon = this.props._visible ? IconMenuDown : IconMenuUp;
        const { t } = this.props;

        return (
            <div className = 'filmstrip__toolbar'>
                <button
                    aria-label = { t('toolbar.accessibilityLabel.toggleFilmstrip') }
                    id = 'toggleFilmstripButton'
                    onClick = { this._onToolbarToggleFilmstrip }>
                    <Icon src = { icon } />
                </button>
            </div>
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated {@code Filmstrip}'s props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const { iAmSipGateway } = state['features/base/config'];
    const { hovered, visible } = state['features/filmstrip'];
    const reduceHeight
        = state['features/toolbox'].visible && interfaceConfig.TOOLBAR_BUTTONS.length;
    const remoteVideosVisible = shouldRemoteVideosBeVisible(state);
    const { isOpen: isModalDialogOpen } = state['features/videoapi/modal-dialog'];
    const { isOpen: isChatOpen } = state['features/chat'];
    const shiftLeft = isModalDialogOpen || isChatOpen;
    const className = `${remoteVideosVisible ? '' : 'hide-videos'} ${
        reduceHeight ? 'reduce-height' : ''
    } ${shiftLeft ? 'shift-left' : ''}`.trim();
    const videosClassName = `filmstrip__videos${visible ? '' : ' hidden'}`;
    const { gridDimensions = {}, filmstripWidth } = state['features/filmstrip'].tileViewDimensions;
    const horizontalViewDimensions = state['features/filmstrip'].horizontalViewDimensions || {};

    const _participantCount = getParticipantCount(state);
    const _dialogOpen = isAnyDialogOpen(state) || shiftLeft;

    return {
        _className: className,
        _columns: gridDimensions.columns,
        _currentLayout: getCurrentLayout(state),
        _dialogOpen,
        _filmstripWidth: filmstripWidth,
        _hideScrollbar: Boolean(iAmSipGateway),
        _hideToolbar: Boolean(iAmSipGateway),
        _horizontalViewDimensions: horizontalViewDimensions,
        _hovered: hovered,
        _participantCount,
        _rows: gridDimensions.rows,
        _videosClassName: videosClassName,
        _visible: visible
    };
}

export default translate(connect(_mapStateToProps)(Filmstrip));
