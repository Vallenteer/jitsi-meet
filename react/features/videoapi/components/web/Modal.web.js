import React, { useEffect } from 'react';
import { connect } from '../../../base/redux';
import { showModalDialog } from '../../actions';
import VideoLayout from '../../../../../modules/UI/videolayout/VideoLayout'
import { IconImage } from '../../../base/icons';
import { IconImageBack } from '../../../base/icons/videoapi';

const Modal = (props) => {
    const {
        children,
        childrenStyle,
        dispatch,
        heading,
        hideButtons,
        footer,
        onClose,
        onDialogDismissed,
        } = props

    const dismiss = (e) => {
        if (onClose) {
            onClose();
        }
        if (onDialogDismissed) {
            onDialogDismissed();
        }
        dispatch(showModalDialog(false));
        VideoLayout.refreshLayout();

    }

    useEffect(() => {
        dispatch(showModalDialog(true));
        VideoLayout.refreshLayout();

    }, []);

    return (
        <div
            className="videoapi-modal-dialog">
            <div className="heading">
                <div className="back"
                    onClick = { dismiss } ><IconImage src={IconImageBack} /></div>
                <div className="title">
                { heading }</div>
            </div>
            <div className = {`children ${childrenStyle || ''}`}>
                { children }
                { footer && footer({ hideButtons }) }
            </div>

        </div>
    );

}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @returns {Object}
 */
function mapStateToProps(state) {

    return {

    };
}


export default connect(mapStateToProps)(Modal);


