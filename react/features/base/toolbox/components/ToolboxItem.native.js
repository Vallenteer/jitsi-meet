// @flow

import React from 'react';
import { Text, TouchableHighlight, View } from 'react-native';

import { Icon } from '../../icons';

import AbstractToolboxItem from './AbstractToolboxItem';
import type { Props } from './AbstractToolboxItem';

/**
 * Native implementation of {@code AbstractToolboxItem}.
 */
export default class ToolboxItem extends AbstractToolboxItem<Props> {
    /**
     * Renders the {@code Icon} part of this {@code ToolboxItem}.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderIcon() {
        const { styles, labelPlacement, showLabel } = this.props;

        const localStyle = styles.iconStyle || {
            alignItems: 'center',
            display: 'flex',
            alignSelf: 'center'
        }
        if (showLabel && labelPlacement === 'bottom') {
            localStyle.borderRadius = styles.style.borderRadius || 0;
            localStyle.borderWidth = styles.style.borderWidth ;
            localStyle.width = styles.style.width;
            localStyle.height = styles.style.height;
            localStyle.backgroundColor = styles.style.backgroundColor;
            localStyle.alignSelf = 'center';
            localStyle.alignItems = 'center';
            localStyle.justifyContent = 'center';


        }
        console.log( localStyle)

        return (
            <Icon
                src = { this.props.icon }
                style = { localStyle } />
        );
    }

    /**
     * Renders this {@code ToolboxItem}. Invoked by {@link AbstractToolboxItem}.
     *
     * @override
     * @protected
     * @returns {ReactElement}
     */
    _renderItem() {
        const {
            disabled,
            elementAfter,
            onClick,
            showLabel,
            styles,
            toggled,
            labelPlacement
        } = this.props;

        let children = this._renderIcon();

        // XXX When using a wrapper View, apply the style to it instead of
        // applying it to the TouchableHighlight.
        let style = styles && styles.style;

        if (showLabel) {
            // XXX TouchableHighlight requires 1 child. If there's a need to
            // show both the icon and the label, then these two need to be
            // wrapped in a View.
            const localStyle = { ...style };
            const localLabelStyle = { ...(styles.labelStyle || {
                alignItems: 'center'
            }) };
            if (labelPlacement === 'bottom') {
                localStyle.flexDirection = 'column';
                localStyle.display = 'flex';
                localStyle.alignItems = 'center';
                localStyle.height = 100;

                delete(localStyle.borderRadius);
                delete(localStyle.borderWidth);
                delete(localStyle.backgroundColor);
                delete(localStyle.flex);

                localLabelStyle.height = 50;
                localLabelStyle.textAlign = 'center'
            }
            children = (
                <View style = { localStyle }>
                    { children }
                    <Text style = { localLabelStyle }>
                        { this.label }
                    </Text>
                    { elementAfter }
                </View>
            );

            // XXX As stated earlier, the style was applied to the wrapper View
            // (above).
            style = undefined;
        }


        return (
            <TouchableHighlight
                accessibilityLabel = { this.accessibilityLabel }
                accessibilityRole = 'button'
                accessibilityState = {{ 'selected': toggled }}
                disabled = { disabled }
                onPress = { onClick }
                style = { style }
                underlayColor = { styles && styles.underlayColor } >
                { children }
            </TouchableHighlight>
        );
    }
}
