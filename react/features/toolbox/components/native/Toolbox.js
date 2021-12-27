// @flow

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { ColorSchemeRegistry } from '../../../base/color-scheme';
import { getFeatureFlag, TOOLBAR_BUTTONS } from '../../../base/flags';
import { Container } from '../../../base/react';
import { connect } from '../../../base/redux';
import { StyleType } from '../../../base/styles';
import { ChatButton } from '../../../chat';
import { isToolboxVisible } from '../../functions';
import AudioMuteButton from '../AudioMuteButton';
import HangupButton from '../HangupButton';
import VideoMuteButton from '../VideoMuteButton';

import OverflowMenuButton from './OverflowMenuButton';
import RaiseHandButton from './RaiseHandButton';
import styles from './styles';

/**
 * The type of {@link Toolbox}'s React {@code Component} props.
 */
type Props = {

    /**
     * The color-schemed stylesheet of the feature.
     */
    _styles: StyleType,

    /**
     * The indicator which determines whether the toolbox is visible.
     */
    _visible: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,

    toolbarButtons: string
};

/**
 * Implements the conference toolbox on React Native.
 */
class Toolbox extends PureComponent<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Container
                style = { styles.toolbox }
                visible = { this.props._visible }>
                { this._renderToolbar() }
            </Container>
        );
    }

    /**
     * Constructs the toggled style of the chat button. This cannot be done by
     * simple style inheritance due to the size calculation done in this
     * component.
     *
     * @param {Object} baseStyle - The base style that was originally
     * calculated.
     * @returns {Object | Array}
     */
    _getChatButtonToggledStyle(baseStyle) {
        const { _styles } = this.props;

        if (Array.isArray(baseStyle.style)) {
            return {
                ...baseStyle,
                style: [
                    ...baseStyle.style,
                    _styles.chatButtonOverride.toggled
                ]
            };
        }

        return {
            ...baseStyle,
            style: [
                baseStyle.style,
                _styles.chatButtonOverride.toggled
            ]
        };
    }

    /**
     * Renders the toolbar. In order to avoid a weird visual effect in which the
     * toolbar is (visually) rendered and then visibly changes its size, it is
     * rendered only after we've figured out the width available to the toolbar.
     *
     * @returns {React$Node}
     */
    _renderToolbar() {
        const { _styles } = this.props;
        const { buttonStyles, buttonStylesBorderless, hangupButtonStyles, toggledButtonStyles } = _styles;

        const hasChat = this.props.toolbarButtons.indexOf('chat') >= 0;
        const hasRaiseHand = this.props.toolbarButtons.indexOf('raisehand') >= 0;
        const hasSettings = this.props.toolbarButtons.indexOf('settings') >= 0;
        const hasHangup = this.props.toolbarButtons.indexOf('hangup') >= 0;
        const hasCam = this.props.toolbarButtons.indexOf('camera') >= 0;
        const hasMic = this.props.toolbarButtons.indexOf('microphone') >= 0;


        if (!(hasChat || hasRaiseHand || hasSettings || hasHangup || hasCam || hasMic)) {
            return (<></>)
        }

        return (
            <View
                accessibilityRole = 'toolbar'
                pointerEvents = 'box-none'
                style = { styles.toolbar }>

                { hasMic && (<AudioMuteButton
                    label = 'Audio'
                    showLabel = {true}
                    labelPlacement = 'bottom'

                    styles = { buttonStyles }
                    toggledStyles = { toggledButtonStyles } />
                )}

                { hasCam && (<VideoMuteButton
                    label = 'Video'
                    showLabel = {true}
                    labelPlacement = 'bottom'

                    styles = { buttonStyles }
                    toggledStyles = { toggledButtonStyles } />
                )}

                { hasChat && (<ChatButton
                    label = 'Chat'
                    showLabel = {true}
                    labelPlacement = 'bottom'
                    styles = { buttonStyles }
                    toggledStyles = { this._getChatButtonToggledStyle(toggledButtonStyles) } />
                )}

                { hasRaiseHand && (<RaiseHandButton
                    label = 'Raise Hand'
                    showLabel = {true}
                    labelPlacement = 'bottom'
                    styles = { buttonStyles }
                    toggledStyles = { toggledButtonStyles } />
                )}

                { hasSettings && (<OverflowMenuButton
                    label = 'Settings'
                    showLabel = {true}
                    labelPlacement = 'bottom'

                    styles = { buttonStyles }
                    toggledStyles = { toggledButtonStyles } />
                )}

                { hasHangup && (<HangupButton
                    label = 'Settings'
                    showLabel = {true}
                    labelPlacement = 'bottom'

                    styles = { hangupButtonStyles } />
                )}
            </View>
        );
    }
}

/**
 * Maps parts of the redux state to {@link Toolbox} (React {@code Component})
 * props.
 *
 * @param {Object} state - The redux state of which parts are to be mapped to
 * {@code Toolbox} props.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state: Object): Object {
    return {
        _styles: ColorSchemeRegistry.get(state, 'Toolbox'),
        _visible: isToolboxVisible(state),
        toolbarButtons: getFeatureFlag(state, TOOLBAR_BUTTONS,
            '')

    };
}

export default connect(_mapStateToProps)(Toolbox);
