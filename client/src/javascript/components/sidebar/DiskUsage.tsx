import {FormattedMessage} from 'react-intl';
import {observer} from 'mobx-react';
import React from 'react';

import type {Disk} from '@shared/types/DiskUsage';

import DiskUsageStore from '../../stores/DiskUsageStore';
import Size from '../general/Size';
import Tooltip from '../general/Tooltip';
import ProgressBar from '../general/ProgressBar';
import SettingStore from '../../stores/SettingStore';

interface DiskUsageTooltipItemProps {
  label: React.ReactNode;
  value: number;
}

const DiskUsageTooltipItem: React.FC<DiskUsageTooltipItemProps> = ({label, value}: DiskUsageTooltipItemProps) => {
  return (
    <li className="diskusage__details-list__item">
      <label className="diskusage__details-list__label">{label}</label>
      <Size className="diskuage__size-used" value={value} />
    </li>
  );
};

const DiskUsage: React.FC = () => {
  const {disks} = DiskUsageStore;
  const {mountPoints} = SettingStore.floodSettings;

  if (disks == null || mountPoints == null) {
    return null;
  }

  const diskMap = disks.reduce((disksByTarget: Record<string, Disk>, disk: Disk) => {
    return {
      ...disksByTarget,
      [disk.target]: disk,
    };
  }, {});

  const diskNodes: React.ReactNodeArray = mountPoints
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

  if (diskNodes == null || diskNodes.length === 0) {
    return null;
  }

  return (
    <ul className="sidebar-filter sidebar__item">
      <li className="sidebar-filter__item sidebar-filter__item--heading">
        <FormattedMessage id="status.diskusage.title" />
      </li>
      {diskNodes}
    </ul>
  );
};

export default observer(DiskUsage);
