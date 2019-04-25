import {injectIntl} from 'react-intl';
import React from 'react';

import AboutTab from './AboutTab';
import AuthTab from './AuthTab';
import BandwidthTab from './BandwidthTab';
import ConnectivityTab from './ConnectivityTab';
import EventTypes from '../../../constants/EventTypes';
import Modal from '../Modal';
import ResourcesTab from './ResourcesTab';
import SettingsStore from '../../../stores/SettingsStore';
import UITab from './UITab';

const METHODS_TO_BIND = [
  'handleClientSettingsChange',
  'handleCustomsSettingChange',
  'handleFloodSettingsChange',
  'handleModalRefSet',
  'handleSaveSettingsClick',
  'handleSaveSettingsError',
  'handleSettingsStoreChange',
];

class SettingsModal extends React.Component {
  constructor() {
    super();

    this.modalBodyRef = null;
    this.state = {
      isSavingSettings: false,
      changedClientSettings: {},
      changedFloodSettings: {},
      clientSettings: SettingsStore.getClientSettings(),
      floodSettings: SettingsStore.getFloodSettings(),
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    SettingsStore.listen(EventTypes.SETTINGS_CHANGE, this.handleSettingsStoreChange);
    SettingsStore.listen(EventTypes.SETTINGS_SAVE_REQUEST_ERROR, this.handleSaveSettingsError);
  }

  componentWillUnmount() {
    SettingsStore.unlisten(EventTypes.SETTINGS_CHANGE, this.handleSettingsStoreChange);
    SettingsStore.unlisten(EventTypes.SETTINGS_SAVE_REQUEST_ERROR, this.handleSaveSettingsError);
  }

  getActions() {
    return [
      {
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
          defaultMessage: 'Cancel',
        }),
        triggerDismiss: true,
        type: 'tertiary',
      },
      {
        clickHandler: this.handleSaveSettingsClick,
        isLoading: this.state.isSavingSettings,
        content: this.props.intl.formatMessage({
          id: 'button.save',
          defaultMessage: 'Save Settings',
        }),
        triggerDismiss: false,
        type: 'primary',
      },
    ];
  }

  handleCustomsSettingChange(data) {
    this.setState({
      changedClientSettings: this.mergeObjects(this.state.changedClientSettings, {
        [data.id]: {...data, overrideLocalSetting: true},
      }),
    });
  }

  handleSaveSettingsClick() {
    let floodSettings = Object.keys(this.state.changedFloodSettings).map(settingsKey => {
      return {
        id: settingsKey,
        data: this.state.changedFloodSettings[settingsKey],
      };
    });

    let clientSettings = Object.keys(this.state.changedClientSettings).map(settingsKey => {
      let data = this.state.changedClientSettings[settingsKey];

      if (data.overrideLocalSetting) {
        return data;
      }

      return {id: settingsKey, data};
    });

    this.setState({isSavingSettings: true});

    SettingsStore.saveFloodSettings(floodSettings, {
      dismissModal: true,
      alert: true,
    });

    SettingsStore.saveClientSettings(clientSettings, {
      dismissModal: true,
      alert: true,
    });
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
      floodSettings: SettingsStore.getFloodSettings(),
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

  handleModalRefSet(id, ref) {
    if (id === 'modal-body') {
      this.modalBodyRef = ref;
    }
  }

  mergeObjects(objA, objB) {
    Object.keys(objB).forEach(key => {
      if (!objB.hasOwnProperty(key) || objB[key] == null) {
        return;
      }

      // If it's an object, then recursive merge.
      if (
        !Array.isArray(objB[key]) &&
        !Array.isArray(objB[key]) &&
        typeof objA[key] === 'object' &&
        typeof objB[key] === 'object'
      ) {
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
          settings: this.mergeObjects(this.state.floodSettings, this.state.clientSettings),
        },
        label: this.props.intl.formatMessage({
          id: 'settings.tabs.bandwidth',
          defaultMessage: 'Bandwidth',
        }),
      },
      connectivity: {
        content: ConnectivityTab,
        props: {
          onCustomSettingsChange: this.handleCustomsSettingChange,
          onClientSettingsChange: this.handleClientSettingsChange,
          settings: this.state.clientSettings,
        },
        label: this.props.intl.formatMessage({
          id: 'settings.tabs.connectivity',
          defaultMessage: 'Connectivity',
        }),
      },
      resources: {
        content: ResourcesTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          settings: this.state.clientSettings,
        },
        label: this.props.intl.formatMessage({
          id: 'settings.tabs.resources',
          defaultMessage: 'Resources',
        }),
      },
      authentication: {
        content: AuthTab,
        label: this.props.intl.formatMessage({
          id: 'settings.tabs.authentication',
          defaultMessage: 'Authentication',
        }),
      },
      ui: {
        content: UITab,
        label: this.props.intl.formatMessage({
          id: 'settings.tabs.userinterface',
          defaultMessage: 'User Interface',
        }),
        props: {
          onSettingsChange: this.handleFloodSettingsChange,
          scrollContainer: this.modalBodyRef,
        },
      },
      about: {
        content: AboutTab,
        label: this.props.intl.formatMessage({
          id: 'settings.tabs.about',
          defaultMessage: 'About',
        }),
      },
    };

    return (
      <Modal
        actions={this.getActions()}
        size="large"
        heading={this.props.intl.formatMessage({
          id: 'settings.tabs.heading',
          defaultMessage: 'Settings',
        })}
        onSetRef={this.handleModalRefSet}
        orientation="vertical"
        dismiss={this.props.dismiss}
        tabs={tabs}
      />
    );
  }
}

export default injectIntl(SettingsModal);
