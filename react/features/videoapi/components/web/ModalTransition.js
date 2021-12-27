import React, { Component } from 'react';

class ModalTransition extends Component<Props> {

    render() {
        if (this.props.component === undefined) {
            return null;
        }
        return (
                <>{ this.props.children }</>
        );
    }


}


export default ModalTransition;
