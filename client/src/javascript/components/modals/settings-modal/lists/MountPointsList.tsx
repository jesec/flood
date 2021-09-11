import {FC, useState} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox} from '@client/ui';
import DiskUsageStore from '@client/stores/DiskUsageStore';
import SettingStore from '@client/stores/SettingStore';
import SortableList, {ListItem} from '@client/components/general/SortableList';

import type {FloodSettings} from '@shared/types/FloodSettings';

interface MountPointsListProps {
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

const MountPointsList: FC<MountPointsListProps> = ({onSettingsChange}: MountPointsListProps) => {
  const [diskItems, setDiskItems] = useState<ListItem[]>(
    ((): ListItem[] => {
      const {mountPoints} = SettingStore.floodSettings;
      const disks = Object.assign(
        {},
        ...DiskUsageStore.disks.map((disk) => ({
          [disk.target]: disk,
        })),
      );

      return mountPoints
        .filter((target) => target in disks)
        .map((target) => ({
          id: target,
          visible: true,
        }))
        .concat(
          Object.keys(disks)
            .filter((target) => !mountPoints.includes(target))
            .map((target) => ({
              id: target,
              visible: false,
            })),
        );
    })(),
  );

  return (
    <SortableList
      id="disks"
      className="sortable-list--disks"
      items={diskItems.slice()}
      lockedIDs={[]}
      onDrop={(items: Array<ListItem>): void => {
        setDiskItems(items);
      }}
      renderItem={(item: ListItem) => {
        const {id, visible} = item;

        const checkbox = (
          <span className="sortable-list__content sortable-list__content--secondary">
            <Checkbox
              defaultChecked={visible}
              id={id}
              onClick={(event) => {
                const newItems = diskItems.map((disk) => {
                  if (disk.id === id) {
                    return {...disk, visible: (event.target as HTMLInputElement).checked};
                  }
                  return disk;
                });

                onSettingsChange({
                  mountPoints: newItems.filter((newItem) => newItem.visible).map((newItem) => newItem.id),
                });
                setDiskItems(newItems);
              }}
            >
              <Trans id="settings.diskusage.show" />
            </Checkbox>
          </span>
        );

        const content = (
          <div className="sortable-list__content sortable-list__content__wrapper">
            <span className="sortable-list__content sortable-list__content--primary">
              <div>{id}</div>
            </span>
            {checkbox}
          </div>
        );

        return content;
      }}
    />
  );
};

export default MountPointsList;
