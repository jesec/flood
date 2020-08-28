import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Checkbox} from '../../../../ui';
import DiskUsageStore from '../../../../stores/DiskUsageStore';
import SettingsStore from '../../../../stores/SettingsStore';
import SortableList from '../../../general/SortableList';

class MountPointsList extends React.Component {
  constructor(props) {
    super(props);

    const mountPoints = SettingsStore.getFloodSettings('mountPoints');
    const disks = DiskUsageStore.getDiskUsage().reduce((disksByTarget, disk) => {
      disksByTarget[disk.target] = disk;
      return disksByTarget;
    }, {});

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

  updateSettings = (diskItems) => {
    const mountPoints = diskItems.filter((item) => item.visible).map((item) => item.id);
    this.props.onSettingsChange({mountPoints});
  };

  handleCheckboxValueChange = (id, value) => {
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

  handleMove = (items) => {
    this.setState({diskItems: items});
    this.updateSettings(items);
  };

  renderItem = (item) => {
    const {id, visible} = item;
    let checkbox = null;

    if (!item.dragIndicator) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox
            checked={visible}
            onChange={(event) => this.handleCheckboxValueChange(id, event.target.checked)}
            modifier="dark">
            <FormattedMessage id="settings.diskusage.show" />
          </Checkbox>
        </span>
      );
    }

    const content = (
      <div className="sortable-list__content sortable-list__content__wrapper">
        <span className="sortable-list__content sortable-list__content--primary">
          <div>{id}</div>
        </span>
        {checkbox}
      </div>
    );

    if (item.dragIndicator) {
      return <div className="sortable-list__item">{content}</div>;
    }

    return content;
  };

  render() {
    const {diskItems} = this.state;

    return (
      <SortableList
        className="sortable-list--disks"
        items={diskItems}
        lockedIDs={[]}
        onMouseDown={this.handleMouseDown}
        onDrop={this.handleMove}
        renderItem={this.renderItem}
      />
    );
  }
}

export default MountPointsList;
