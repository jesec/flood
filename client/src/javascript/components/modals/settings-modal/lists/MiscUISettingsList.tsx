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
  const [filterLocationEnabled, setFilterLocationEnabled] = useState<FloodSettings['UISidebarFilterLocation']>(
    SettingStore.floodSettings.UISidebarFilterLocation,
  );
  const [filterTrackerEnabled, setFilterTrackerEnabled] = useState<FloodSettings['UISidebarFilterTracker']>(
    SettingStore.floodSettings.UISidebarFilterTracker,
  );
  const [filterTagEnabled, setFilterTagEnabled] = useState<FloodSettings['UISidebarFilterTag']>(
    SettingStore.floodSettings.UISidebarFilterTag,
  );

  const handlePageTitleSpeedToggle = () => {
    const nextValue = !pageTitleSpeedEnabled;
    setPageTitleSpeedEnabled(nextValue);
    onSettingsChange({UIPageTitleSpeedEnabled: nextValue});
  };
  const handleFilterLocationToggle = () => {
    const nextValue = !filterLocationEnabled;
    setFilterLocationEnabled(nextValue);
    onSettingsChange({UISidebarFilterLocation: nextValue});
  };
  const handleFilterTrackerToggle = () => {
    const nextValue = !filterTrackerEnabled;
    setFilterTrackerEnabled(nextValue);
    onSettingsChange({UISidebarFilterTracker: nextValue});
  };
  const handleFilterTagToggle = () => {
    const nextValue = !filterTagEnabled;
    setFilterTagEnabled(nextValue);
    onSettingsChange({UISidebarFilterTag: nextValue});
  };
  return (
    <ToggleList
      items={[
        {
          label: 'settings.ui.page.title.speed',
          checked: pageTitleSpeedEnabled,
          onClick: handlePageTitleSpeedToggle,
        },
        {
          label: 'settings.ui.sidebar.filter.location',
          checked: filterLocationEnabled,
          onClick: handleFilterLocationToggle,
        },
        {
          label: 'settings.ui.sidebar.filter.tracker',
          checked: filterTrackerEnabled,
          onClick: handleFilterTrackerToggle,
        },
        {
          label: 'settings.ui.sidebar.filter.tag',
          checked: filterTagEnabled,
          onClick: handleFilterTagToggle,
        },
      ]}
    />
  );
};

export default MiscUISettingsList;
