import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import type {ClientSettings} from '@shared/types/ClientSettings';
import type {FloodSettings} from '@shared/types/FloodSettings';

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

interface SettingsModalProps extends WrappedComponentProps {
  clientSettings?: ClientSettings | null;
  floodSettings?: FloodSettings | null;
}

interface SettingsModalStates extends Record<string, unknown> {
  isSavingSettings: boolean;
  changedClientSettings: Partial<ClientSettings>;
  changedFloodSettings: Partial<FloodSettings>;
}

class SettingsModal extends React.Component<SettingsModalProps, SettingsModalStates> {
  constructor(props: SettingsModalProps) {
    super(props);
    this.state = {
      isSavingSettings: false,
      changedClientSettings: {},
      changedFloodSettings: {},
    };
  }

  getActions(): Modal['props']['actions'] {
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
    this.setState({isSavingSettings: true}, () => {
      Promise.all([
        SettingsStore.saveFloodSettings(this.state.changedFloodSettings, {
          dismissModal: true,
          alert: true,
        }),
        SettingsStore.saveClientSettings(this.state.changedClientSettings, {
          dismissModal: true,
          alert: true,
        }),
      ]).then(() => {
        this.setState({isSavingSettings: false});
      });
    });
  };

  handleFloodSettingsChange = (changedSettings: Partial<FloodSettings>) => {
    this.setState((state) => {
      const changedFloodSettings = {
        ...state.changedFloodSettings,
        ...changedSettings,
      };

      return {changedFloodSettings};
    });
  };

  handleClientSettingsChange = (changedSettings: Partial<ClientSettings>) => {
    this.setState((state) => {
      const changedClientSettings = {
        ...state.changedClientSettings,
        ...changedSettings,
      };

      return {changedClientSettings};
    });
  };

  render() {
    const {clientSettings, floodSettings, intl} = this.props;

    const tabs = {
      bandwidth: {
        content: BandwidthTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          onSettingsChange: this.handleFloodSettingsChange,
          clientSettings,
          floodSettings,
        },
        label: intl.formatMessage({
          id: 'settings.tabs.bandwidth',
        }),
      },
      connectivity: {
        content: ConnectivityTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          clientSettings,
          floodSettings,
        },
        label: intl.formatMessage({
          id: 'settings.tabs.connectivity',
        }),
      },
      resources: {
        content: ResourcesTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          clientSettings,
          floodSettings,
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
        : {}),
      ui: {
        content: UITab,
        label: intl.formatMessage({
          id: 'settings.tabs.userinterface',
        }),
        props: {
          onSettingsChange: this.handleFloodSettingsChange,
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
        orientation={window.matchMedia('(max-width: 720px)').matches ? 'horizontal' : 'vertical'}
        tabs={tabs}
      />
    );
  }
}

const ConnectedSettingsModal = connectStores<Omit<SettingsModalProps, 'intl'>, SettingsModalStates>(
  injectIntl(SettingsModal),
  () => {
    return [
      {
        store: SettingsStore,
        event: 'SETTINGS_CHANGE',
        getValue: () => {
          return {
            clientSettings: SettingsStore.getClientSettings(),
            floodSettings: SettingsStore.getFloodSettings(),
          };
        },
      },
    ];
  },
);

export default ConnectedSettingsModal;
