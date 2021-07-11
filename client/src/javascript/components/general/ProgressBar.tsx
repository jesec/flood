import {FC} from 'react';
import {observer} from 'mobx-react';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import TorrentStatusIcon from './TorrentStatusIcon';

interface ProgressBarProps {
  percent: number;
  status?: TorrentStatus;
}

const ProgressBar: FC<ProgressBarProps> = observer(({percent, status}: ProgressBarProps) => (
  <div className="progress-bar">
    <div className="progress-bar__icon">{status && <TorrentStatusIcon status={status} />}</div>
    <div className="progress-bar__fill__wrapper">
      <div className="progress-bar__fill" style={{width: `${percent}%`}} />
    </div>
  </div>
));

ProgressBar.defaultProps = {
  status: undefined,
};

export default ProgressBar;
