import {FC, useState} from 'react';

import SettingStore from '@client/stores/SettingStore';
import ToggleList from '@client/components/general/ToggleList';

import type {FloodSettings} from '@shared/types/FloodSettings';

interface MiscUISettingsListProps {
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

const MiscUISettingsList: FC<MiscUISettingsListProps> = ({onSettingsChange}: MiscUISettingsListProps) => {
  const [pageTitleSpeedEnabled, setPageTitleSpeedEnabled] = useState<FloodSettings['UIPageTitleSpeedEnabled']>(
    SettingStore.floodSettings.UIPageTitleSpeedEnabled,
  );

  const handlePageTitleSpeedToggle = () => {
    const nextValue = !pageTitleSpeedEnabled;
    setPageTitleSpeedEnabled(nextValue);
    onSettingsChange({UIPageTitleSpeedEnabled: nextValue});
  };
  return (
    <ToggleList
      items={[
        {
          label: 'settings.ui.page.title.speed',
          checked: pageTitleSpeedEnabled,
          onClick: handlePageTitleSpeedToggle,
        },
      ]}
    />
  );
};

export default MiscUISettingsList;
