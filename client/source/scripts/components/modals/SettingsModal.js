import classnames from 'classnames';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import Modal from './Modal';
import SettingsSpeedLimit from './SettingsSpeedLimit';
import SettingsStore from '../../stores/SettingsStore';

const METHODS_TO_BIND = [
  'handleSettingsChange',
  'handleSaveSettingsClick',
  'handleSettingsFetchRequestSuccess'
];

export default class AddTorrents extends React.Component {
  constructor() {
    super();

    this.state = {
      settings: {
        speedLimits: {
          download: null,
          upload: null
        }
      }
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    SettingsStore.listen(EventTypes.SETTINGS_FETCH_REQUEST_SUCCESS, this.handleSettingsFetchRequestSuccess);
    SettingsStore.fetchSettings('speedLimits');
  }

  componentWillUnmount() {
    SettingsStore.unlisten(EventTypes.SETTINGS_FETCH_REQUEST_SUCCESS, this.handleSettingsFetchRequestSuccess);
  }

  getActions() {
    let icon = null;
    let primaryButtonText = 'Add Torrent';

    if (this.state.isAddingTorrents) {
      icon = <LoadingIndicatorDots viewBox="0 0 32 32" />;
      primaryButtonText = 'Adding...';
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
        content: 'Save Settings',
        triggerDismiss: false,
        type: 'primary'
      }
    ];
  }

  handleSaveSettingsClick() {
    let settingsToSave = Object.keys(this.state.settings).map((settingsKey) =>  {
      return {
        id: settingsKey,
        data: this.state.settings[settingsKey]
      };
    });

    SettingsStore.saveSettings(settingsToSave);
  }

  handleSettingsFetchRequestError(error) {
    console.log(error);
  }

  handleSettingsFetchRequestSuccess() {
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
        content: (
          <SettingsSpeedLimit onSettingsChange={this.handleSettingsChange}
            settings={this.state.settings} />
        ),
        label: 'Speed Limits'
      }
    };

    return (
      <Modal actions={this.getActions()} classNames="modal--large"
        heading="Settings" orientation="vertical" dismiss={this.props.dismiss}
        tabs={tabs} />
    );
  }
}
