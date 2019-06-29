import {injectIntl} from 'react-intl';
import React from 'react';

import AboutTab from './AboutTab';
import AuthTab from './AuthTab';
import BandwidthTab from './BandwidthTab';
import ConnectivityTab from './ConnectivityTab';
import connectStores from '../../../util/connectStores';
import EventTypes from '../../../constants/EventTypes';
import Modal from '../Modal';
import ResourcesTab from './ResourcesTab';
import SettingsStore from '../../../stores/SettingsStore';
import UITab from './UITab';

class SettingsModal extends React.Component {
  state = {
    isSavingSettings: false,
    changedClientSettings: {},
    changedFloodSettings: {},
  };

  modalBodyRef = null;

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

  handleCustomsSettingChange = data => {
    this.setState(state => {
      return {
        changedClientSettings: this.mergeObjects(state.changedClientSettings, {
          [data.id]: {...data, overrideLocalSetting: true},
        }),
      };
    });
  };

  handleSaveSettingsClick = () => {
    const floodSettings = Object.keys(this.state.changedFloodSettings).map(settingsKey => ({
      id: settingsKey,
      data: this.state.changedFloodSettings[settingsKey],
    }));

    const clientSettings = Object.keys(this.state.changedClientSettings).map(settingsKey => {
      const data = this.state.changedClientSettings[settingsKey];

      if (data.overrideLocalSetting) {
        return data;
      }

      return {id: settingsKey, data};
    });

    this.setState({isSavingSettings: true}, () => {
      Promise.all([
        SettingsStore.saveFloodSettings(floodSettings, {
          dismissModal: true,
          alert: true,
        }),
        SettingsStore.saveClientSettings(clientSettings, {
          dismissModal: true,
          alert: true,
        }),
      ]).then(() => {
        this.setState({isSavingSettings: false});
      });
    });
  };

  handleFloodSettingsChange = changedSettings => {
    this.setState((state, props) => {
      const floodSettings = this.mergeObjects(props.floodSettings, changedSettings);
      const changedFloodSettings = this.mergeObjects(state.changedFloodSettings, changedSettings);

      return {floodSettings, changedFloodSettings};
    });
  };

  handleClientSettingsChange = changedSettings => {
    this.setState((state, props) => {
      const clientSettings = this.mergeObjects(props.clientSettings, changedSettings);
      const changedClientSettings = this.mergeObjects(state.changedClientSettings, changedSettings);

      return {clientSettings, changedClientSettings};
    });
  };

  handleModalRefSet = (id, ref) => {
    if (id === 'modal-body') {
      this.modalBodyRef = ref;
    }
  };

  // TODO: Use lodash or something non-custom for this
  mergeObjects(objA, objB) {
    Object.keys(objB).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(objB, key) || objB[key] == null) {
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
    const {clientSettings, floodSettings, intl} = this.props;

    const tabs = {
      bandwidth: {
        content: BandwidthTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          onSettingsChange: this.handleFloodSettingsChange,
          settings: this.mergeObjects(floodSettings, clientSettings),
        },
        label: intl.formatMessage({
          id: 'settings.tabs.bandwidth',
          defaultMessage: 'Bandwidth',
        }),
      },
      connectivity: {
        content: ConnectivityTab,
        props: {
          onCustomSettingsChange: this.handleCustomsSettingChange,
          onClientSettingsChange: this.handleClientSettingsChange,
          settings: clientSettings,
        },
        label: intl.formatMessage({
          id: 'settings.tabs.connectivity',
          defaultMessage: 'Connectivity',
        }),
      },
      resources: {
        content: ResourcesTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          settings: clientSettings,
        },
        label: intl.formatMessage({
          id: 'settings.tabs.resources',
          defaultMessage: 'Resources',
        }),
      },
      authentication: {
        content: AuthTab,
        label: intl.formatMessage({
          id: 'settings.tabs.authentication',
          defaultMessage: 'Authentication',
        }),
      },
      ui: {
        content: UITab,
        label: intl.formatMessage({
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
        label: intl.formatMessage({
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

const ConnectedSettingsModal = connectStores(injectIntl(SettingsModal), () => {
  return [
    {
      store: SettingsStore,
      event: EventTypes.SETTINGS_CHANGE,
      getValue: ({store}) => {
        return {
          clientSettings: store.getClientSettings(),
          floodSettings: store.getFloodSettings(),
        };
      },
    },
  ];
});

export default ConnectedSettingsModal;
