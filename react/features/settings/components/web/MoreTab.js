// @flow


import React, { useState } from 'react';

import { translate } from '../../../base/i18n';

/**
 * The type of the React {@code Component} props of {@link MoreTab}.
 */
export type Props = {
    ...$Exact<AbstractDialogTabProps>,

    /**
     * The currently selected language to display in the language select
     * dropdown.
     */
    currentLanguage: string,

    /**
     * Whether or not follow me is currently active (enabled by some other participant).
     */
    followMeActive: boolean,

    /**
     * Whether or not the user has selected the Follow Me feature to be enabled.
     */
    followMeEnabled: boolean,

    /**
     * All available languages to display in the language select dropdown.
     */
    languages: Array<string>,

    /**
     * Whether or not to display the language select dropdown.
     */
    showLanguageSettings: boolean,

    /**
     * Whether or not to display moderator-only settings.
     */
    showModeratorSettings: boolean,

    /**
     * Whether or not to display the prejoin settings section.
     */
    showPrejoinSettings: boolean,

    /**
     * Whether or not to show prejoin screen.
     */
    showPrejoinPage: boolean,

    /**
     * Whether or not the user has selected the Start Audio Muted feature to be
     * enabled.
     */
    startAudioMuted: boolean,

    /**
     * Whether or not the user has selected the Start Video Muted feature to be
     * enabled.
     */
    startVideoMuted: boolean,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * The type of the React {@code Component} state of {@link MoreTab}.
 */
type State = {

    /**
     * Whether or not the language select dropdown is open.
     */
    isLanguageSelectOpen: boolean
};

/**
 * React {@code Component} for modifying language and moderator settings.
 *
 * @extends Component
 */
const MoreTab = props => {

    const [ selectedLanguage, setSelectedLanguage] = useState(props.currentLanguage);
    const { showModeratorSettings, showLanguageSettings, parentOnChange } = props;
    const content = [];

    /**
     * Returns the menu item for changing displayed language.
     *
     * @private
     * @returns {ReactElement}
     */
    const _renderLanguageSelect = () => {
        const {
            currentLanguage,
            languages,
            t
        } = props;

        const languageItems
            = languages.map(language => (
                <option
                    key = { language }
                    value = { language }
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange = {
                        (e) => parentOnChange({ currentLanguage: language }) }>
                    { t(`languages:${language}`) }
                </option>));

        return (
            <div
                className = 'settings-sub-pane language-settings'
                key = 'language'>
                <div className = 'settings-entry'>
                    { t('settings.language') }
                </div>
                <select
                    onChange = {(e) => {
                        setSelectedLanguage(e.target.value)
                        parentOnChange({ currentLanguage: e.target.value })
                    }}
                    value = {selectedLanguage}>
                    { languageItems }

                </select>
            </div>
        );
    };

    /**
     * Returns the React Element for modifying conference-wide settings.
     *
     * @private
     * @returns {ReactElement}
     */
    const _renderModeratorSettings = () => {
        const {
            followMeActive,
            followMeEnabled,
            startAudioMuted,
            startVideoMuted,
            t
        } = props;

        return (
            <div
                className = 'settings-sub-pane'
                key = 'moderator'>
                <div className = 'settings-entry'>
                    { t('settings.moderator') }
                </div>
                <label className = 'checkbox'>
                    { t('settings.startAudioMuted') }
                    <input
                        type = { 'checkbox' }
                        checked = { startAudioMuted }
                        name = 'start-audio-muted'
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange = {
                            ({ target: { checked } }) =>
                            parentOnChange({ startAudioMuted: checked })
                        } />
                </label>
                <label className = 'checkbox'>
                    { t('settings.startVideoMuted') }
                    <input
                        type = { 'checkbox' }
                        checked = { startVideoMuted }
                        name = 'start-video-muted'
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange = {
                            ({ target: { checked } }) =>
                            parentOnChange({ startVideoMuted: checked })
                        } />
                </label>
                <label className = 'checkbox'>
                    { t('settings.followMe') }
                    <input
                        type = { 'checkbox' }
                        checked = { followMeEnabled && !followMeActive }
                        disabled = { followMeActive }
                        name = 'follow-me'
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange = {
                            ({ target: { checked } }) =>
                            parentOnChange({ followMeEnabled: checked })
                        } />
                </label>

            </div>
        );
    };


    if (showLanguageSettings) {
        content.push(_renderLanguageSelect());
    }
    if (showModeratorSettings) {
        content.push(_renderModeratorSettings());
    }

    return <div className = 'more-tab'>{ content }</div>;

};

export default translate(MoreTab);
