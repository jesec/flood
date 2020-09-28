import {injectIntl} from 'react-intl';
import React from 'react';

import AboutTab from './AboutTab';
import AuthTab from './AuthTab';
import BandwidthTab from './BandwidthTab';
import ConnectivityTab from './ConnectivityTab';
import connectStores from '../../../util/connectStores';
import Modal from '../Modal';
import ResourcesTab from './ResourcesTab';
import ConfigStore from '../../../stores/ConfigStore';
import SettingsStore from '../../../stores/SettingsStore';
import UITab from './UITab';
import DiskUsageTab from './DiskUsageTab';

class SettingsModal extends React.Component {
  modalBodyRef = null;

  constructor(props) {
    super(props);
    this.state = {
      isSavingSettings: false,
      changedClientSettings: {},
      changedFloodSettings: {},
    };
  }

  getActions() {
    return [
      {
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
        }),
        triggerDismiss: true,
        type: 'tertiary',
      },
      {
        clickHandler: this.handleSaveSettingsClick,
        isLoading: this.state.isSavingSettings,
        content: this.props.intl.formatMessage({
          id: 'button.save',
        }),
        triggerDismiss: false,
        type: 'primary',
      },
    ];
  }

  handleSaveSettingsClick = () => {
    const floodSettings = Object.keys(this.state.changedFloodSettings).map((settingsKey) => ({
      id: settingsKey,
      data: this.state.changedFloodSettings[settingsKey],
    }));

    const clientSettings = Object.keys(this.state.changedClientSettings).map((settingsKey) => ({
      id: settingsKey,
      data: this.state.changedClientSettings[settingsKey],
    }));

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

  handleFloodSettingsChange = (changedSettings) => {
    this.setState((state, props) => {
      const floodSettings = this.mergeObjects(props.floodSettings, changedSettings);
      const changedFloodSettings = this.mergeObjects(state.changedFloodSettings, changedSettings);

      return {floodSettings, changedFloodSettings};
    });
  };

  handleClientSettingsChange = (changedSettings) => {
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
    Object.keys(objB).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(objB, key) || objB[key] == null) {
        return;
      }

      // Blacklist __proto__ and constructor to avoid prototype pollution
      if (key === '__proto__' || key === 'constructor') {
        return;
      }

      // If it's an object, then recursive merge.
      if (
        !Array.isArray(objA[key]) &&
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
        }),
      },
      connectivity: {
        content: ConnectivityTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          settings: clientSettings,
        },
        label: intl.formatMessage({
          id: 'settings.tabs.connectivity',
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
        }),
      },
      // TODO: disableUsersAndAuth is server's config not user's
      ...(!ConfigStore.getDisableAuth()
        ? {
            authentication: {
              content: AuthTab,
              label: intl.formatMessage({
                id: 'settings.tabs.authentication',
              }),
            },
          }
        : []),
      ui: {
        content: UITab,
        label: intl.formatMessage({
          id: 'settings.tabs.userinterface',
        }),
        props: {
          onSettingsChange: this.handleFloodSettingsChange,
          scrollContainer: this.modalBodyRef,
        },
      },
      diskusage: {
        content: DiskUsageTab,
        label: intl.formatMessage({
          id: 'settings.tabs.diskusage',
        }),
        props: {
          onSettingsChange: this.handleFloodSettingsChange,
        },
      },
      about: {
        content: AboutTab,
        label: intl.formatMessage({
          id: 'settings.tabs.about',
        }),
      },
    };

    return (
      <Modal
        actions={this.getActions()}
        size="large"
        heading={this.props.intl.formatMessage({
          id: 'settings.tabs.heading',
        })}
        onSetRef={this.handleModalRefSet}
        orientation={window.matchMedia('(max-width: 720px)').matches ? 'horizontal' : 'vertical'}
        tabs={tabs}
      />
    );
  }
}

const ConnectedSettingsModal = connectStores(injectIntl(SettingsModal), () => {
  return [
    {
      store: SettingsStore,
      event: 'SETTINGS_CHANGE',
      getValue: ({store}) => {
        const storeSettings = store;
        return {
          clientSettings: storeSettings.getClientSettings(),
          floodSettings: storeSettings.getFloodSettings(),
        };
      },
    },
  ];
});

export default ConnectedSettingsModal;
