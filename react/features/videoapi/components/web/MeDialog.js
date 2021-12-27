import React, { useEffect, useRef, useState } from 'react';

import { getMyName } from '../../api'
import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import { updateSettings } from '../../../base/settings';

/**
 * Implements a React {@link Component} which displays Me component.
 *
 * @returns {ReactElement}
 */
function MeDialog({
    _emailAddress,
    dispatch,
    t
}: Props) {
    const [ imageFile, setImageFile ] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    const [ displayName, setDisplayName ] = useState(getMyName());
    const [ emailAddress, setEmailAddress ] = useState(_emailAddress);
    const inputFile = useRef(null) ;




    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    useEffect(()=>{
        const mePhoto = localStorage.getItem('videoapi.mePhoto');
        if (mePhoto) {
            setImageFile(mePhoto);
        }

    }, [displayName, emailAddress])

    return (
        <Dialog
            hideCancelButton = { true }
            okKey = 'videoapi.title.save'
            titleKey = 'videoapi.title.me'
            onSubmit = {() => {
                dispatch(updateSettings({
                    displayName, email: emailAddress
                }));
                return true;
            }}
            width = 'small'>
            <input
                accept = 'image/x-png,image/jpeg'
                id = 'file'
                onChange = { (event) => {
                    const file = event.target.files[0];
                    toBase64(file).then(r => {
                        setImageFile(r);
                        localStorage.setItem('videoapi.mePhoto', r);
                    })
                }}
                ref={inputFile}
                style={{display: 'none'}}
                type = 'file'
                />
            <div
                className = 'me-photo-dialog'
                onClick = { () => {
                    inputFile.current.click();
                }}>
                <img src = { imageFile } />
                <div>{ t('videoapi.form.me.changeProfilePhoto')}</div>
            </div>

            <div className = 'videoapi-form-entry'>
                <label htmlFor = 'display-name'>{ t('videoapi.form.me.displayName') }</label>
                <input
                    autoComplete = 'off'
                    type = 'text'
                    name = 'displayName'
                    id = 'displayName'
                    value = { displayName }
                    onChange = { (e) => setDisplayName(e.target.value) } />
            </div>

            <div className = 'videoapi-form-entry'>
                <label htmlFor = 'email-address'>{ t('videoapi.form.me.emailAddress') }</label>
                <input
                    autoComplete = 'off'
                    type = 'email'
                    name = 'emailAddress'
                    id = 'emailAddress'
                    value = { emailAddress }

                    onChange = { (e) => setEmailAddress(e.target.value) }  />
            </div>

        </Dialog>
    );
}


/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @returns {Object}
 */
function mapStateToProps(state) {
    const { email } = state['features/base/settings'];
    return {
        _emailAddress: email
    };
}


export default translate(connect(mapStateToProps)(MeDialog));
