import {FormattedMessage} from 'react-intl';
import React from 'react';

import DiskUsageStore from '../../stores/DiskUsageStore';
import Size from '../general/Size';
import Tooltip from '../general/Tooltip';
import connectStores from '../../util/connectStores';
import ProgressBar from '../general/ProgressBar';
import SettingsStore from '../../stores/SettingsStore';

import type {Disk, Disks} from '../../stores/DiskUsageStore';

interface DiskUsageProps {
  disks?: Disks;
  mountPoints?: Array<string>;
}

const DiskUsageTooltipItem = ({label, value}: {label: object; value: number}) => {
  return (
    <li className="diskusage__details-list__item">
      <label className="diskusage__details-list__label">{label}</label>
      <Size className="diskuage__size-used" value={value} />
    </li>
  );
};

class DiskUsage extends React.Component<DiskUsageProps> {
  getDisks() {
    const {disks, mountPoints} = this.props;

    if (disks == null || mountPoints == null) {
      return null;
    }

    const diskMap = disks.reduce((disksByTarget: Record<string, Disk>, disk: Disk) => {
      disksByTarget[disk.target] = disk;
      return disksByTarget;
    }, {});

    return mountPoints
      .filter((target) => target in diskMap)
      .map((target) => diskMap[target])
      .map((d) => {
        return (
          <li key={d.target} className="sidebar-filter__item sidebar__diskusage">
            <Tooltip
              content={
                <ul className="diskusage__details-list">
                  <DiskUsageTooltipItem value={d.used} label={<FormattedMessage id="status.diskusage.used" />} />
                  <DiskUsageTooltipItem value={d.avail} label={<FormattedMessage id="status.diskusage.free" />} />
                  <DiskUsageTooltipItem value={d.size} label={<FormattedMessage id="status.diskusage.total" />} />
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

    if (disks == null || disks.length === 0) {
      return null;
    }

    return (
      <ul className="sidebar-filter sidebar__item">
        <li className="sidebar-filter__item sidebar-filter__item--heading">
          <FormattedMessage id="status.diskusage.title" />
        </li>
        {disks}
      </ul>
    );
  }
}

export default connectStores(DiskUsage, () => [
  {
    store: DiskUsageStore,
    event: 'DISK_USAGE_CHANGE',
    getValue: ({store}) => {
      const storeDiskUsage = store as typeof DiskUsageStore;
      return {
        disks: storeDiskUsage.getDiskUsage(),
      };
    },
  },
  {
    store: SettingsStore,
    event: 'SETTINGS_CHANGE',
    getValue: ({store}) => {
      const storeSettings = store as typeof SettingsStore;
      return {
        mountPoints: storeSettings.getFloodSetting('mountPoints'),
      };
    },
  },
]);
