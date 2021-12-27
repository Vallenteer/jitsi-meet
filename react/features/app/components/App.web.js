// @flow

import React from 'react';

import { DialogContainer } from '../../base/dialog';
import { ChromeExtensionBanner } from '../../chrome-extension-banner';

import { AbstractApp } from './AbstractApp';

// Register middlewares and reducers.
import '../middlewares';
import '../reducers';

/**
 * Root app {@code Component} on Web/React.
 *
 * @extends AbstractApp
 */
export class App extends AbstractApp {
    /**
     * Overrides the parent method to inject {@link AtlasKitThemeProvider} as
     * the top most component.
     *
     * @override
     */
    _createMainElement(component, props) {
        return (
            <div className='videoapi-main-container' mode = 'dark'>
                <ChromeExtensionBanner />
                { super._createMainElement(component, props) }
            </div>
        );
    }

    /**
     * Renders the platform specific dialog container.
     *
     * @returns {React$Element}
     */
    _renderDialogContainer() {
        return (
            <div className='videoapi-dialog-container' mode = 'dark'>
                <DialogContainer />
            </div>
        );
    }
}