import {FormattedMessage} from 'react-intl';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import DiskUsageStore from '../../stores/DiskUsageStore';
import Size from '../general/Size';
import Tooltip from '../general/Tooltip';
import connectStores from '../../util/connectStores';
import ProgressBar from '../general/ProgressBar';
import SettingsStore from '../../stores/SettingsStore';

const DiskUsageTooltipItem = ({label, value}) => {
  return (
    <li className="diskusage__details-list__item">
      <label className="diskusage__details-list__label">{label}</label>
      <Size className="diskuage__size-used" value={value} />
    </li>
  );
};

class DiskUsage extends React.Component {
  getDisks() {
    const {disks, mountPoints} = this.props;
    const diskMap = disks.reduce((disksByTarget, disk) => {
      disksByTarget[disk.target] = disk;
      return disksByTarget;
    }, {});
    return mountPoints
      .filter(target => target in diskMap)
      .map(target => diskMap[target])
      .map(d => {
        return (
          <li key={d.target} className="sidebar-filter__item sidebar__diskusage">
            <Tooltip
              content={
                <ul className="diskusage__details-list">
                  <DiskUsageTooltipItem
                    value={d.used}
                    label={<FormattedMessage id="status.diskusage.used" defaultMessage="Used" />}
                  />
                  <DiskUsageTooltipItem
                    value={d.avail}
                    label={<FormattedMessage id="status.diskusage.free" defaultMessage="Free" />}
                  />
                  <DiskUsageTooltipItem
                    value={d.size}
                    label={<FormattedMessage id="status.diskusage.total" defaultMessage="Total" />}
                  />
                </ul>
              }
              position="top"
              wrapperClassName="diskusage__item">
              <div className="diskusage__text-row">
                {d.target}
                <span>{Math.round((100 * d.used) / d.size)}%</span>
              </div>
              <ProgressBar percent={(100 * d.used) / d.size} />
            </Tooltip>
          </li>
        );
      });
  }

  render() {
    const disks = this.getDisks();

    if (disks.length === 0) {
      return null;
    }

    return (
      <ul className="sidebar-filter sidebar__item">
        <li className="sidebar-filter__item sidebar-filter__item--heading">
          <FormattedMessage id="status.diskusage.title" defaultMessage="Disk Usage" />
        </li>
        {disks}
      </ul>
    );
  }
}

export default connectStores(DiskUsage, () => [
  {
    store: DiskUsageStore,
    event: EventTypes.DISK_USAGE_CHANGE,
    getValue: ({store}) => ({
      disks: store.getDiskUsage(),
    }),
  },
  {
    store: SettingsStore,
    event: EventTypes.SETTINGS_CHANGE,
    getValue: ({store}) => {
      return {
        mountPoints: store.getFloodSettings('mountPoints'),
      };
    },
  },
]);
