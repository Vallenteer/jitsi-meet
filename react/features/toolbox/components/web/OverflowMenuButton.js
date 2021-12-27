/* @flow */

import React, { Component } from 'react';
import { IconImageHangup, IconImageMore } from '../../../../../../src/icons';

import { createToolbarEvent, sendAnalytics } from '../../../analytics';
import { translate } from '../../../base/i18n';
import InlineDialog from '../../../videoapi/components/web/InlineDialog';

import ToolbarButton from './ToolbarButton';

/**
 * The type of the React {@code Component} props of {@link OverflowMenuButton}.
 */
type Props = {

    /**
     * A child React Element to display within {@code InlineDialog}.
     */
    children: React$Node,

    /**
     * Whether or not the OverflowMenu popover should display.
     */
    isOpen: boolean,

    /**
     * Calback to change the visibility of the overflow menu.
     */
    onVisibilityChange: Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * A React {@code Component} for opening or closing the {@code OverflowMenu}.
 *
 * @extends Component
 */
class OverflowMenuButton extends Component<Props> {
    /**
     * Initializes a new {@code OverflowMenuButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onCloseDialog = this._onCloseDialog.bind(this);
        this._onToggleDialogVisibility
            = this._onToggleDialogVisibility.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { children, isOpen, t, classNameIcon, state } = this.props;
        if(state === 'hangup') {
            console.log("Hangup state!");
            return (
                <div className = 'videoapi-hangup-button'>
                    <InlineDialog
                        content = { children }
                        isOpen = { isOpen }
                        onClose = { this._onCloseDialog }
                        position = { 'top right' }>
                        <ToolbarButton
                            title = 'Leave'
                            accessibilityLabel =
                                { t('toolbar.accessibilityLabel.hangup') }
                            empty = { true }
                            iconImage = { IconImageHangup }
                            onClick = { this._onToggleDialogVisibility }
                            toggled = { isOpen }
                            tooltip = { t('toolbar.moreActions') }
                            classNameIcon = {classNameIcon || ''} />
                    </InlineDialog>
                </div>
            )
        } else {
            return (
                <div className = 'videoapi-more-button'>
                    <InlineDialog
                        content = { children }
                        isOpen = { isOpen }
                        onClose = { this._onCloseDialog }
                        position = { 'top right' }>
                        <ToolbarButton
                            title = 'Menu'
                            accessibilityLabel =
                                { t('toolbar.accessibilityLabel.moreActions') }
                            empty = { true }
                            iconImage = { IconImageMore }
                            onClick = { this._onToggleDialogVisibility }
                            toggled = { isOpen }
                            tooltip = { t('toolbar.moreActions') }
                            classNameIcon = {classNameIcon || ''} />
                    </InlineDialog>
                </div>
            );
        }
    }

    _onCloseDialog: () => void;

    /**
     * Callback invoked when {@code InlineDialog} signals that it should be
     * close.
     *
     * @private
     * @returns {void}
     */
    _onCloseDialog() {
        this.props.onVisibilityChange(false);
    }

    _onToggleDialogVisibility: () => void;

    /**
     * Callback invoked to signal that an event has occurred that should change
     * the visibility of the {@code InlineDialog} component.
     *
     * @private
     * @returns {void}
     */
    _onToggleDialogVisibility() {
        sendAnalytics(createToolbarEvent('overflow'));

        this.props.onVisibilityChange(!this.props.isOpen);
    }
}

export default translate(OverflowMenuButton);
