import {css} from '@emotion/react';
import {FC, ReactNode, ReactNodeArray} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

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
  <li aria-label="label" className="diskusage__details-list__item" role="cell">
    <span className="diskusage__details-list__label">{label}</span>
    <Size className="diskuage__size-used" value={value} />
  </li>
);

const DiskUsage: FC = observer(() => {
  const {i18n} = useLingui();

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
      <li key={d.target} className="sidebar-filter__item sidebar__diskusage" role="row">
        <Tooltip
          content={
            <ul className="diskusage__details-list" role="tooltip">
              <DiskUsageTooltipItem value={d.used} label={i18n._('status.diskusage.used')} />
              <DiskUsageTooltipItem value={d.avail} label={i18n._('status.diskusage.free')} />
              <DiskUsageTooltipItem value={d.size} label={i18n._('status.diskusage.total')} />
            </ul>
          }
          position="top"
          styles={css({
            cursor: 'default',
          })}
          wrapperClassName="diskusage__item"
        >
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

  const title = i18n._('status.diskusage.title');

  return (
    <ul aria-label={title} className="sidebar-filter sidebar__item" role="table">
      <li className="sidebar-filter__item sidebar-filter__item--heading">{title}</li>
      {diskNodes}
    </ul>
  );
});

export default DiskUsage;
