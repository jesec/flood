import classnames from 'classnames';
import {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {useLingui} from '@lingui/react';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import TorrentStatusIcon from './TorrentStatusIcon';

interface ProgressBarProps {
  percent: number;
  status?: TorrentStatus;
  showPercentLabel?: boolean;
}

const ProgressBar: FC<ProgressBarProps> = observer(({percent, status, showPercentLabel = false}: ProgressBarProps) => {
  const {i18n} = useLingui();
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const percentLabel =
    clampedPercent === 0 || clampedPercent === 100
      ? i18n.number(clampedPercent, {maximumFractionDigits: 0})
      : i18n.number(clampedPercent, {minimumFractionDigits: 1, maximumFractionDigits: 1});

  return (
    <div className={classnames('progress-bar', {'progress-bar--with-percent': showPercentLabel})}>
      <div className="progress-bar__icon">{status && <TorrentStatusIcon status={status} />}</div>
      <div className="progress-bar__fill__wrapper">
        <div className="progress-bar__fill" style={{width: `${clampedPercent}%`}} />
        {showPercentLabel ? <span className="progress-bar__percent">{percentLabel}%</span> : null}
      </div>
    </div>
  );
});

export default ProgressBar;
