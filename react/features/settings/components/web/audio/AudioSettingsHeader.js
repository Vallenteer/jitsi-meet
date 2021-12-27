// @flow

import React from 'react';

import { Icon } from '../../../../base/icons';

/**
 * The type of the React {@code Component} props of {@link AudioSettingsHeader}.
 */
type Props = {

    /**
     * The Icon used for the Header.
     */
    IconComponent: Function,

    /**
     * The text of the Header.
     */
    text: string,
};

/**
 * React {@code Component} representing the Header of an audio option group.
 *
 * @returns { ReactElement}
 */
export default function AudioSettingsHeader({ IconComponent, text, onClick }: Props) {
    return (
        <li className = 'overflow-menu-item' onClick = { onClick }>
            <div className = 'audio-preview-header-text'>{text}</div>
        </li>
    );
}
