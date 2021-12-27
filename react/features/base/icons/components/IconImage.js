// @flow

import React from 'react';

import { Container } from '../../react/base';
import { styleTypeToObject } from '../../styles';

type Props = {

    /**
     * Class name for the web platform, if any.
     */
    className: string,

    /**
     * Color of the icon (if not provided by the style object).
     */
    color?: string,

    /**
     * Id prop (mainly for autotests).
     */
    id?: string,

    /**
     * Function to invoke on click.
     */
    onClick?: Function,

    /**
     * The size of the icon (if not provided by the style object).
     */
    size?: number | string,

    /**
     * The preloaded icon component to render.
     */
    src: Function,

    /**
     * Style object to be applied.
     */
    style?: Object,

    src: Object
};

/**
 * Implements an Icon component that takes a loaded SVG file as prop and renders it as an icon.
 *
 * @param {Props} props - The props of the component.
 * @returns {Reactelement}
 */
export default function IconImage(props: Props) {
    const {
        className,
        onClick,
        src,
        style,
        indicatorMuted
    } = props;

    return (
        <Container
            className = { `videoapi-icon-image ${className}` }
            onClick = { onClick }
            style = { style }>
            <img src = { src } style = {indicatorMuted && { width: 15 } }/>
        </Container>
    );
}

IconImage.defaultProps = {
    className: ''}
