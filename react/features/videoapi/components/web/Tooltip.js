import React, { Component } from 'react';

class Tooltip extends Component<Props> {

    render() {
        return (
            <div>
                { this.props.children }
            </div>
        );
    }


}


export default Tooltip;
