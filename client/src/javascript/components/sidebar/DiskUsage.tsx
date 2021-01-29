import {FC, ReactNode, ReactNodeArray} from 'react';
import {observer} from 'mobx-react';
import {Trans} from '@lingui/react';

import type {Disk} from '@shared/types/DiskUsage';

import DiskUsageStore from '../../stores/DiskUsageStore';
import Size from '../general/Size';
import Tooltip from '../general/Tooltip';
import ProgressBar from '../general/ProgressBar';
import SettingStore from '../../stores/SettingStore';

interface DiskUsageTooltipItemProps {
  label: ReactNode;
  value: number;
}

const DiskUsageTooltipItem: FC<DiskUsageTooltipItemProps> = ({label, value}: DiskUsageTooltipItemProps) => (
  <li className="diskusage__details-list__item">
    <label className="diskusage__details-list__label">{label}</label>
    <Size className="diskuage__size-used" value={value} />
  </li>
);

const DiskUsage: FC = observer(() => {
  const {disks} = DiskUsageStore;
  const {mountPoints} = SettingStore.floodSettings;

  if (disks == null || mountPoints == null) {
    return null;
  }

  const diskMap = disks.reduce(
    (disksByTarget: Record<string, Disk>, disk: Disk) => ({
      ...disksByTarget,
      [disk.target]: disk,
    }),
    {},
  );

  const diskNodes: ReactNodeArray = mountPoints
    .filter((target) => target in diskMap)
    .map((target) => diskMap[target])
    .map((d) => (
      <li key={d.target} className="sidebar-filter__item sidebar__diskusage">
        <Tooltip
          content={
            <ul className="diskusage__details-list">
              <DiskUsageTooltipItem value={d.used} label={<Trans id="status.diskusage.used" />} />
              <DiskUsageTooltipItem value={d.avail} label={<Trans id="status.diskusage.free" />} />
              <DiskUsageTooltipItem value={d.size} label={<Trans id="status.diskusage.total" />} />
            </ul>
          }
          position="top"
          wrapperClassName="diskusage__item">
          <div className="diskusage__text-row">
            {d.target}
            <span>{Math.round((100 * d.used) / d.size)}%</span>
          </div>
          <ProgressBar percent={Math.round((100 * d.used) / d.size)} />
        </Tooltip>
      </li>
    ));

  if (diskNodes == null || diskNodes.length === 0) {
    return null;
  }

  return (
    <ul className="sidebar-filter sidebar__item">
      <li className="sidebar-filter__item sidebar-filter__item--heading">
        <Trans id="status.diskusage.title" />
      </li>
      {diskNodes}
    </ul>
  );
});

export default DiskUsage;
