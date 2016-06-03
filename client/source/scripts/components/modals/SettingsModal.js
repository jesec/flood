import classnames from 'classnames';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import Modal from './Modal';
import SettingsStore from '../../stores/SettingsStore';
import SpeedLimitTab from '../settings/SpeedLimitTab';

const METHODS_TO_BIND = [
  'handleSaveSettingsClick',
  'handleSaveSettingsError',
  'handleSettingsChange',
  'handleSettingsStoreChange'
];

export default class SettingsModal extends React.Component {
  constructor() {
    super();

    this.state = {
      isSavingSettings: false,
      settings: SettingsStore.getSettings()
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    SettingsStore.listen(EventTypes.SETTINGS_CHANGE,
      this.handleSettingsStoreChange);
    SettingsStore.listen(EventTypes.SETTINGS_SAVE_REQUEST_ERROR,
      this.handleSaveSettingsError);
    SettingsStore.fetchSettings('speedLimits');
  }

  componentWillUnmount() {
    SettingsStore.unlisten(EventTypes.SETTINGS_CHANGE,
      this.handleSettingsStoreChange);
  }

  getActions() {
    let icon = null;
    let primaryButtonText = 'Save Settings';

    if (this.state.isSavingSettings) {
      icon = <LoadingIndicatorDots viewBox="0 0 32 32" />;
      primaryButtonText = 'Saving...';
    }

    return [
      {
        clickHandler: null,
        content: 'Cancel',
        triggerDismiss: true,
        type: 'secondary'
      },
      {
        clickHandler: this.handleSaveSettingsClick,
        content: (
          <span>
            {icon}
            {primaryButtonText}
          </span>
        ),
        supplementalClassName: icon != null ? 'has-icon' : '',
        triggerDismiss: false,
        type: 'primary'
      }
    ];
  }

  handleSaveSettingsClick() {
    this.setState({isSavingSettings: true});

    let settingsToSave = Object.keys(this.state.settings).map((settingsKey) =>  {
      return {
        id: settingsKey,
        data: this.state.settings[settingsKey]
      };
    });

    SettingsStore.saveSettings(settingsToSave, {dismissModal: true, notify: true});
  }

  handleSaveSettingsError() {
    this.setState({isSavingSettings: false});
  }

  handleSettingsFetchRequestError(error) {
    console.log(error);
  }

  handleSettingsStoreChange() {
    this.setState({
      settings: SettingsStore.getSettings()
    });
  }

  handleSettingsChange(changedSettings) {
    let settings = this.mergeObjects(this.state.settings, changedSettings);
    this.setState({settings});
  }

  mergeObjects(objA, objB) {
    Object.keys(objB).forEach((key) => {
      if (!objB.hasOwnProperty(key) || objB[key] == null) {
        return;
      }

      // If it's an object, then recursive merge.
      if (!Array.isArray(objB[key]) && !Array.isArray(objB[key]) && typeof objA[key] === 'object' && typeof objB[key] === 'object') {
        objA[key] = this.mergeObjects(objA[key], objB[key]);
      } else {
        objA[key] = objB[key];
      }
    });

    return objA;
  }

  render() {
    let tabs = {
      'speed-limit': {
        content: SpeedLimitTab,
        props: {
          onSettingsChange: this.handleSettingsChange,
          settings: this.state.settings
        },
        label: 'Speed Limits'
      }
    };

    return (
      <Modal actions={this.getActions()} size="large"
        heading="Settings" orientation="vertical" dismiss={this.props.dismiss}
        tabs={tabs} />
    );
  }
}
