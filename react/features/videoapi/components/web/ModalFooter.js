import React, { Component } from 'react';

class ModalFooter extends Component<Props> {
    hideButtons = !!this.props.hideButtons;

    render() {
        return (
            <>
                { this.hideButtons === false && (
                    <div className='videoapi-form-entry bottom'>
                    { this.props.children }
                    </div>
                    )
                }
            </>
        );
    }


}


export default ModalFooter;
