import {FC, useRef} from 'react';

import SettingStore from '@client/stores/SettingStore';
import ToggleList from '@client/components/general/ToggleList';

import type {FloodSettings} from '@shared/types/FloodSettings';

interface MiscUISettingsListProps {
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

const MiscUISettingsList: FC<MiscUISettingsListProps> = ({onSettingsChange}: MiscUISettingsListProps) => {
  const changedUIPageTitleSpeedEnabledRef = useRef<FloodSettings['UIPageTitleSpeedEnabled']>(
    SettingStore.floodSettings.UIPageTitleSpeedEnabled,
  );

  return (
    <ToggleList
      items={[
        {
          label: 'settings.ui.page.title.speed',
          defaultChecked: changedUIPageTitleSpeedEnabledRef.current,
          onClick: () => {
            changedUIPageTitleSpeedEnabledRef.current = !changedUIPageTitleSpeedEnabledRef.current;
            onSettingsChange({UIPageTitleSpeedEnabled: changedUIPageTitleSpeedEnabledRef.current});
          },
        },
      ]}
    />
  );
};

export default MiscUISettingsList;
