import {Checkbox, Form, FormRow, Select, SelectItem, Radio} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsStore from '../../../stores/SettingsStore';
import SettingsTab from './SettingsTab';
import SortableList from '../../general/SortableList';
import DiskUsageStore from '../../../stores/DiskUsageStore';

class DiskUsageTab extends SettingsTab {
  tooltipRef = null;

  state = {
    diskItems: [],
  };

  componentWillMount() {
    const mountPoints = SettingsStore.getFloodSettings('mountPoints');
    const disks = DiskUsageStore.getDiskUsage().reduce((disksByTarget, disk) => {
      disksByTarget[disk.target] = disk;
      return disksByTarget;
    }, {});

    // assemble disk items from saved "mountPoints" and list of disks "disks"
    // first targets saved in mountPoints that exist in disks
    // then remaing targets from disks
    const diskItems = mountPoints
      .filter(target => target in disks)
      .map(target => ({
        id: target,
        visible: true,
      }))
      .concat(
        Object.keys(disks)
          .filter(target => !mountPoints.includes(target))
          .map(target => ({
            id: target,
            visible: false,
          })),
      );

    this.setState({diskItems});
  }

  updateSettings = diskItems => {
    const mountPoints = diskItems.filter(item => item.visible).map(item => item.id);
    this.props.onSettingsChange({mountPoints});
  };

  handleDiskCheckboxValueChange = (id, value) => {
    const {diskItems} = this.state;

    const newItems = diskItems.map(disk => {
      if (disk.id === id) {
        return {...disk, visible: value};
      }
      return disk;
    });

    this.setState({diskItems: newItems});
    this.updateSettings(newItems);
  };

  handleDiskMouseDown = () => {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }
  };

  handleDiskMove = items => {
    this.setState({diskItems: items});
    this.updateSettings(items);
  };

  renderDiskItem = (item, index) => {
    const {id, visible} = item;
    let checkbox = null;

    if (!item.dragIndicator) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox
            checked={visible}
            onChange={event => this.handleDiskCheckboxValueChange(id, event.target.checked)}
            modifier="dark">
            <FormattedMessage id="settings.diskusage.show" defaultMessage="Show" />
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
      <Form>
        <ModalFormSectionHeader>
          <FormattedMessage defaultMessage="Disk Usage Mount Points" id="settings.diskusage.mount.points" />
        </ModalFormSectionHeader>
        <FormRow>
          <SortableList
            className="sortable-list--disks"
            items={diskItems}
            lockedIDs={[]}
            onMouseDown={this.handleDiskMouseDown}
            onDrop={this.handleDiskMove}
            renderItem={this.renderDiskItem}
          />
        </FormRow>
      </Form>
    );
  }
}

export default injectIntl(DiskUsageTab);
