/* @flow */

import Tooltip from '../../../videoapi/components/web/Tooltip';
import React from 'react';

import { Icon, IconImage } from '../../../base/icons';
import AbstractToolbarButton from '../AbstractToolbarButton';
import type { Props as AbstractToolbarButtonProps }
    from '../AbstractToolbarButton';

/**
 * The type of the React {@code Component} props of {@link ToolbarButton}.
 */
type Props = AbstractToolbarButtonProps & {

    /**
     * The text to display in the tooltip.
     */
    tooltip: string,

    /**
     * From which direction the tooltip should appear, relative to the
     * button.
     */
    tooltipPosition: string
};

/**
 * Represents a button in the toolbar.
 *
 * @extends AbstractToolbarButton
 */
class ToolbarButton extends AbstractToolbarButton<Props> {
    /**
     * Default values for {@code ToolbarButton} component's properties.
     *
     * @static
     */
    static defaultProps = {
        tooltipPosition: 'top'
    };

    /**
     * Initializes a new {@code ToolbarButton} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._onKeyDown = this._onKeyDown.bind(this);
    }

    _onKeyDown: (Object) => void;

    /**
     * Handles 'Enter' key on the button to trigger onClick for accessibility.
     * We should be handling Space onKeyUp but it conflicts with PTT.
     *
     * @param {Object} event - The key event.
     * @private
     * @returns {void}
     */
    _onKeyDown(event) {
        // If the event coming to the dialog has been subject to preventDefault
        // we don't handle it here.
        if (event.defaultPrevented) {
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            this.props.onClick();
        }
    }

    /**
     * Renders the button of this {@code ToolbarButton}.
     *
     * @param {Object} children - The children, if any, to be rendered inside
     * the button. Presumably, contains the icon of this {@code ToolbarButton}.
     * @protected
     * @returns {ReactElement} The button of this {@code ToolbarButton}.
     */
    _renderButton(children) {
        return (
            <div
                style = {{
                    display: "flex",
                    flexDirection: 'column',
                    textAlign: 'center',
                    alignItems: 'center'}}>
                <div
                    aria-label = { this.props.accessibilityLabel }
                    aria-pressed = { this.props.toggled }
                    className = {`toolbox-button ${this.props.className || ''}`}
                    onClick = { this.props.onClick }
                    onKeyDown = { this._onKeyDown }
                    role = 'button'
                    tabIndex = { 0 }>
                    { this.props.tooltip
                        ? <Tooltip
                            content = { this.props.tooltip }
                            position = { this.props.tooltipPosition }>
                            { children }
                        </Tooltip>
                        : children }
                </div>
                <div>{this.props.title}</div>
            </div>
        );
    }

    /**
     * Renders the icon of this {@code ToolbarButton}.
     *
     * @inheritdoc
     */
    _renderIcon() {
        return (
            <div className = { `${this.props.empty ? 'toolbox-icon-empty' : 'toolbox-icon'} ${this.props.classNameIcon} ${this.props.toggled ? 'toggled' : ''}` }>
                { this.props.iconImage ? <IconImage src = { this.props.iconImage } /> : <Icon src = { this.props.icon } /> }
            </div>
        );
    }
}

export default ToolbarButton;