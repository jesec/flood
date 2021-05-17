import {FC, useRef} from 'react';

import SettingStore from '@client/stores/SettingStore';
import ToggleList from '@client/components/general/ToggleList';
import TorrentContextMenuActions from '@client/constants/TorrentContextMenuActions';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import type {TorrentContextMenuAction} from '@client/constants/TorrentContextMenuActions';

import type {FloodSettings} from '@shared/types/FloodSettings';

interface TorrentContextMenuActionsListProps {
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

const TorrentContextMenuActionsList: FC<TorrentContextMenuActionsListProps> = ({
  onSettingsChange,
}: TorrentContextMenuActionsListProps) => {
  const changedTorrentContextMenuActionsRef = useRef<FloodSettings['torrentContextMenuActions']>(
    defaultFloodSettings.torrentContextMenuActions.map(({id, visible: defaultVisible}) => ({
      id,
      visible:
        SettingStore.floodSettings.torrentContextMenuActions.find((setting) => setting.id === id)?.visible ??
        defaultVisible,
    })),
  );

  return (
    <ToggleList
      checkboxLabel="settings.ui.torrent.context.menu.items.show"
      items={Object.keys(TorrentContextMenuActions).map((action) => ({
        label: TorrentContextMenuActions[action as TorrentContextMenuAction],
        isLocked: action === 'start' || action === 'stop' || action === 'setTaxonomy' || action === 'torrentDetails',
        defaultChecked: changedTorrentContextMenuActionsRef.current.some(
          (setting) => setting.id === action && setting.visible,
        ),
        onClick: () => {
          const currentSetting = changedTorrentContextMenuActionsRef.current.find((setting) => setting.id === action);
          if (currentSetting != null) {
            currentSetting.visible = !currentSetting.visible;
          }
          onSettingsChange({torrentContextMenuActions: changedTorrentContextMenuActionsRef.current});
        },
      }))}
    />
  );
};

export default TorrentContextMenuActionsList;
