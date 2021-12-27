// @flow

import { translate } from '../../../base/i18n';
import { IconVideoQualityHD, IconVideoQualityLD, IconVideoQualitySD } from '../../../base/icons';
import { connect } from '../../../base/redux';
import { AbstractButton, type AbstractButtonProps } from '../../../base/toolbox/components';
import { setPreferredVideoQuality } from '../../../video-quality';
import { getCurrentPreferredVideoQuality } from '../../../videoapi/api';
import { VIDEO_QUALITY_LEVELS } from '..//./../../video-quality/constants';

const {
    ULTRA,
    HIGH,
    STANDARD,
    LOW
} = VIDEO_QUALITY_LEVELS;

/**
 * The type of the React {@code Component} props of {@link VideoQualityButton}.
 */
type Props = AbstractButtonProps & {

    /**
     * The menu indicator.
     */
    isMenu: boolean,

    /**
     * The quality.
     */
    quality: Object,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Dispatch<any>
};

/**
 * An implementation of a button to show more menu options.
 */
class VideoQualityButton extends AbstractButton<Props, any> {
    accessibilityLabel = 'toolbar.accessibilityLabel.videoQuality';

    constructor(props) {
        super(props);
            this.icon = this.props.icon || IconVideoQualityHD;
        if (this.props.isMenu) {
            this.label = 'Video Quality Preference'
        } else {
            if (this.props.quality === LOW) {
                this.icon = IconVideoQualityLD;
                this.label = 'Low';
            } else if (this.props.quality === STANDARD) {
                this.icon = IconVideoQualitySD;
                this.label = 'Standard';
            } else {
                this.icon = IconVideoQualityHD;
                this.label = 'High';
            }
        }
    }


    /**
     * Handles clicking / pressing the button.
     *
     * @override
     * @protected
     * @returns {void}
     */
    _handleClick() {
        if (!this.props.isMenu) {
            this.props.dispatch(setPreferredVideoQuality(this.props.quality))
        }
    }

}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} ownProps - The properties explicitly passed to the component instance.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state, ownProps): Object {
    const { quality, isMenu, icon } = ownProps;

    return {
        quality,
        isMenu,
        icon
    };
}

export default translate(connect(_mapStateToProps)(VideoQualityButton));
