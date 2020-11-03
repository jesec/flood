import {FC, useState} from 'react';
import {useIntl} from 'react-intl';
import {useMediaQuery} from '@react-hook/media-query';

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

const SettingsModal: FC = () => {
  const intl = useIntl();
  const isSmallScreen = useMediaQuery('(max-width: 720px)');

  const [changedClientSettings, setChangedClientSettings] = useState<Partial<ClientSettings>>({});
  const [changedFloodSettings, setChangedFloodSettings] = useState<Partial<FloodSettings>>({});
  const [isSavingSettings, setSavingSettings] = useState<boolean>(false);

  const handleClientSettingsChange = (changedSettings: Partial<ClientSettings>) => {
    setChangedClientSettings({
      ...changedClientSettings,
      ...changedSettings,
    });
  };

  const handleFloodSettingsChange = (changedSettings: Partial<FloodSettings>) => {
    setChangedFloodSettings({
      ...changedFloodSettings,
      ...changedSettings,
    });
  };

  const tabs = {
    bandwidth: {
      content: BandwidthTab,
      props: {
        onClientSettingsChange: handleClientSettingsChange,
        onSettingsChange: handleFloodSettingsChange,
      },
      label: intl.formatMessage({
        id: 'settings.tabs.bandwidth',
      }),
    },
    connectivity: {
      content: ConnectivityTab,
      props: {
        onClientSettingsChange: handleClientSettingsChange,
      },
      label: intl.formatMessage({
        id: 'settings.tabs.connectivity',
      }),
    },
    resources: {
      content: ResourcesTab,
      props: {
        onClientSettingsChange: handleClientSettingsChange,
      },
      label: intl.formatMessage({
        id: 'settings.tabs.resources',
      }),
    },
    ...(ConfigStore.authMethod !== 'none'
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
        onSettingsChange: handleFloodSettingsChange,
      },
    },
    diskusage: {
      content: DiskUsageTab,
      label: intl.formatMessage({
        id: 'settings.tabs.diskusage',
      }),
      props: {
        onSettingsChange: handleFloodSettingsChange,
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
      actions={[
        {
          clickHandler: null,
          content: intl.formatMessage({
            id: 'button.cancel',
          }),
          triggerDismiss: true,
          type: 'tertiary',
        },
        {
          clickHandler: () => {
            setSavingSettings(true);
            Promise.all([
              SettingActions.saveSettings(changedFloodSettings, {
                alert: true,
              }),
              ClientActions.saveSettings(changedClientSettings, {
                alert: true,
              }),
            ]).then(() => {
              setSavingSettings(false);
              UIStore.dismissModal();
            });
          },
          isLoading: isSavingSettings,
          content: intl.formatMessage({
            id: 'button.save',
          }),
          triggerDismiss: false,
          type: 'primary',
        },
      ]}
      size="large"
      heading={intl.formatMessage({
        id: 'settings.tabs.heading',
      })}
      orientation={isSmallScreen ? 'horizontal' : 'vertical'}
      tabs={tabs}
    />
  );
};

export default SettingsModal;
