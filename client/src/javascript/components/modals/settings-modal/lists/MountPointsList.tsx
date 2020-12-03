import {Component} from 'react';
import {FormattedMessage} from 'react-intl';

import type {FloodSettings} from '@shared/types/FloodSettings';

import {Checkbox} from '../../../../ui';
import DiskUsageStore from '../../../../stores/DiskUsageStore';
import SettingStore from '../../../../stores/SettingStore';
import SortableList, {ListItem} from '../../../general/SortableList';

interface MountPointsListProps {
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

interface MountPointsListStates {
  diskItems: Array<ListItem>;
}

class MountPointsList extends Component<MountPointsListProps, MountPointsListStates> {
  constructor(props: MountPointsListProps) {
    super(props);

    const {mountPoints} = SettingStore.floodSettings;
    const disks = Object.assign(
      {},
      ...DiskUsageStore.disks.map((disk) => {
        return {
          [disk.target]: disk,
        };
      }),
    );

    // assemble disk items from saved "mountPoints" and list of disks "disks"
    // first targets saved in mountPoints that exist in disks
    // then remaining targets from disks
    const diskItems = mountPoints
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

    this.state = {
      diskItems,
    };
  }

  updateSettings = (diskItems: Array<ListItem>) => {
    this.props.onSettingsChange({
      mountPoints: diskItems.filter((item) => item.visible).map((item) => item.id),
    });
  };

  handleCheckboxValueChange = (id: string, value: boolean) => {
    const {diskItems} = this.state;

    const newItems = diskItems.map((disk) => {
      if (disk.id === id) {
        return {...disk, visible: value};
      }
      return disk;
    });

    this.setState({diskItems: newItems});
    this.updateSettings(newItems);
  };

  handleMouseDown = () => {
    // do nothing.
  };

  handleMove = (items: Array<ListItem>): void => {
    this.setState({diskItems: items});
    this.updateSettings(items);
  };

  renderItem = (item: ListItem) => {
    const {id, visible} = item;

    const checkbox = (
      <span className="sortable-list__content sortable-list__content--secondary">
        <Checkbox
          defaultChecked={visible}
          onClick={(event) => this.handleCheckboxValueChange(id, (event.target as HTMLInputElement).checked)}>
          <FormattedMessage id="settings.diskusage.show" />
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
  };

  render() {
    const {diskItems} = this.state;

    return (
      <SortableList
        id="disks"
        className="sortable-list--disks"
        items={diskItems.slice()}
        lockedIDs={[]}
        onMouseDown={this.handleMouseDown}
        onDrop={this.handleMove}
        renderItem={this.renderItem}
      />
    );
  }
}

export default MountPointsList;
