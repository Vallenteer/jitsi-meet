/* @flow */

import React, { Component } from 'react';

import { IconMicDisabled } from '../../../base/icons';
import { BaseIndicator } from '../../../base/react';
import { IconImageCamOffRed, IconImageMicOffRed } from '../../../../../../src/icons';

/**
 * The type of the React {@code Component} props of {@link AudioMutedIndicator}.
 */
type Props = {

    /**
     * From which side of the indicator the tooltip should appear from.
     */
    tooltipPosition: string
};

/**
 * React {@code Component} for showing an audio muted icon with a tooltip.
 *
 * @extends Component
 */
class AudioMutedIndicator extends Component<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <BaseIndicator
                indicatorMuted = { true }
                className = 'audioMuted toolbar-icon'
                iconId = 'mic-disabled'
                iconImage = {IconImageMicOffRed}
                style = { { height: 13, width: 13 } }
                iconSize = { 13 }
                tooltipKey = 'videothumbnail.mute'
                tooltipPosition = { this.props.tooltipPosition } />
        );
    }
}

export default AudioMutedIndicator;
