import {Component} from 'react';
import {injectIntl, WrappedComponentProps} from 'react-intl';

import type {ClientSettings} from '@shared/types/ClientSettings';
import type {FloodSettings} from '@shared/types/FloodSettings';

import AboutTab from './AboutTab';
import AuthTab from './AuthTab';
import BandwidthTab from './BandwidthTab';
import ConfigStore from '../../../stores/ConfigStore';
import ConnectivityTab from './ConnectivityTab';
import ClientActions from '../../../actions/ClientActions';
import DiskUsageTab from './DiskUsageTab';
import Modal from '../Modal';
import ResourcesTab from './ResourcesTab';
import SettingActions from '../../../actions/SettingActions';
import UITab from './UITab';
import UIStore from '../../../stores/UIStore';

import type {ModalAction} from '../../../stores/UIStore';

interface SettingsModalStates {
  isSavingSettings: boolean;
  changedClientSettings: Partial<ClientSettings>;
  changedFloodSettings: Partial<FloodSettings>;
}

class SettingsModal extends Component<WrappedComponentProps, SettingsModalStates> {
  constructor(props: WrappedComponentProps) {
    super(props);

    this.state = {
      isSavingSettings: false,
      changedClientSettings: {},
      changedFloodSettings: {},
    };
  }

  getActions(): Array<ModalAction> {
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
        SettingActions.saveSettings(this.state.changedFloodSettings, {
          alert: true,
        }),
        ClientActions.saveSettings(this.state.changedClientSettings, {
          alert: true,
        }),
      ]).then(() => {
        this.setState({isSavingSettings: false});
        UIStore.dismissModal();
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
    const {intl} = this.props;

    const tabs = {
      bandwidth: {
        content: BandwidthTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
          onSettingsChange: this.handleFloodSettingsChange,
        },
        label: intl.formatMessage({
          id: 'settings.tabs.bandwidth',
        }),
      },
      connectivity: {
        content: ConnectivityTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
        },
        label: intl.formatMessage({
          id: 'settings.tabs.connectivity',
        }),
      },
      resources: {
        content: ResourcesTab,
        props: {
          onClientSettingsChange: this.handleClientSettingsChange,
        },
        label: intl.formatMessage({
          id: 'settings.tabs.resources',
        }),
      },
      ...(!ConfigStore.disableAuth
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

export default injectIntl(SettingsModal);
