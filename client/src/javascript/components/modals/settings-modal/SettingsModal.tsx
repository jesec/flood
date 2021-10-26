import {FC, useState} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

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

const SettingsModal: FC = observer(() => {
  const {i18n} = useLingui();

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
      label: i18n._('settings.tabs.bandwidth'),
    },
    connectivity: {
      content: ConnectivityTab,
      props: {
        onClientSettingsChange: handleClientSettingsChange,
      },
      label: i18n._('settings.tabs.connectivity'),
    },
    resources: {
      content: ResourcesTab,
      props: {
        onClientSettingsChange: handleClientSettingsChange,
      },
      label: i18n._('settings.tabs.resources'),
    },
    ...(ConfigStore.authMethod !== 'none'
      ? {
          authentication: {
            content: AuthTab,
            label: i18n._('settings.tabs.authentication'),
          },
        }
      : {}),
    ui: {
      content: UITab,
      label: i18n._('settings.tabs.userinterface'),
      props: {
        onSettingsChange: handleFloodSettingsChange,
      },
    },
    diskusage: {
      content: DiskUsageTab,
      label: i18n._('settings.tabs.diskusage'),
      props: {
        onSettingsChange: handleFloodSettingsChange,
      },
    },
    about: {
      content: AboutTab,
      label: i18n._('settings.tabs.about'),
    },
  };

  return (
    <Modal
      actions={[
        {
          clickHandler: null,
          content: i18n._('button.cancel'),
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
              UIStore.setActiveModal(null);
            });
          },
          isLoading: isSavingSettings,
          content: i18n._('button.save'),
          triggerDismiss: false,
          type: 'primary',
        },
      ]}
      size="large"
      heading={i18n._('settings.tabs.heading')}
      orientation={ConfigStore.isSmallScreen ? 'horizontal' : 'vertical'}
      tabs={tabs}
    />
  );
});

export default SettingsModal;
