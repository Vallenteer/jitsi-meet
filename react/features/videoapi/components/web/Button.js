import React from 'react';
import { translate } from '../../../base/i18n';

const Button = ({
    children,
    id,
    key,
    onClick,
}:Props) => {

        return (
            <button
                id = { id }
                key = { key }
                onClick = { onClick }>
                { children }
            </button>
        );
}


export default translate(Button);
