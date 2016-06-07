import classnames from 'classnames';
import React from 'react';

import BandwidthTab from '../settings/BandwidthTab';
import ConnectivityTab from '../settings/ConnectivityTab';
import EventTypes from '../../constants/EventTypes';
import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import Modal from './Modal';
import SettingsStore from '../../stores/SettingsStore';
import StorageTab from '../settings/StorageTab';

const METHODS_TO_BIND = [
  'handleSaveSettingsClick',
  'handleSaveSettingsError',
  'handleClientSettingsChange',
  'handleFloodSettingsChange',
  'handleSettingsStoreChange'
];

export default class SettingsModal extends React.Component {
  constructor() {
    super();

    this.state = {
      isSavingSettings: false,
      changedClientSettings: {},
      changedFloodSettings: {},
      clientSettings: SettingsStore.getClientSettings(),
      floodSettings: SettingsStore.getFloodSettings()
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
    SettingsStore.fetchFloodSettings('speedLimits');
  }

  componentWillUnmount() {
    SettingsStore.unlisten(EventTypes.SETTINGS_CHANGE,
      this.handleSettingsStoreChange);
    SettingsStore.unlisten(EventTypes.SETTINGS_SAVE_REQUEST_ERROR,
      this.handleSaveSettingsError);
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

    let floodSettings = Object.keys(this.state.changedFloodSettings).map((settingsKey) =>  {
      return {
        id: settingsKey,
        data: this.state.changedFloodSettings[settingsKey]
      };
    });

    let clientSettings = Object.keys(this.state.changedClientSettings).map((settingsKey) =>  {
      return {
        id: settingsKey,
        data: this.state.changedClientSettings[settingsKey]
      };
    });

    SettingsStore.saveFloodSettings(floodSettings, {dismissModal: true, notify: true});
    SettingsStore.saveClientSettings(clientSettings, {dismissModal: true, notify: true});
  }

  handleSaveSettingsError() {
    this.setState({isSavingSettings: false});
  }

  handleSettingsFetchRequestError(error) {
    console.log(error);
  }

  handleSettingsStoreChange() {
    this.setState({
      clientSettings: SettingsStore.getClientSettings(),
      floodSettings: SettingsStore.getFloodSettings()
    });
  }

  handleFloodSettingsChange(changedSettings) {
    let floodSettings = this.mergeObjects(this.state.floodSettings, changedSettings);
    let changedFloodSettings = this.mergeObjects(this.state.changedFloodSettings, changedSettings);

    this.setState({floodSettings, changedFloodSettings});
  }

  handleClientSettingsChange(changedSettings) {
    let clientSettings = this.mergeObjects(this.state.clientSettings, changedSettings);
    let changedClientSettings = this.mergeObjects(this.state.changedClientSettings, changedSettings);

    this.setState({clientSettings, changedClientSettings});
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
      bandwidth: {
        content: BandwidthTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          onSettingsChange: this.handleFloodSettingsChange,
          settings: this.mergeObjects(this.state.floodSettings, this.state.clientSettings)
        },
        label: 'Bandwidth'
      },
      connectivity: {
        content: ConnectivityTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          settings: this.state.clientSettings
        },
        label: 'Connectivity'
      },
      storage: {
        content: StorageTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          settings: this.state.clientSettings
        },
        label: 'Storage'
      }
    };

    return (
      <Modal actions={this.getActions()} size="large"
        heading="Settings" orientation="vertical" dismiss={this.props.dismiss}
        tabs={tabs} />
    );
  }
}
