import {FC, memo} from 'react';

interface ProgressBarProps {
  percent: number;
  icon?: JSX.Element;
}

const ProgressBar: FC<ProgressBarProps> = memo(({percent, icon}: ProgressBarProps) => (
  <div className="progress-bar">
    <div className="progress-bar__icon">{icon}</div>
    <div className="progress-bar__fill__wrapper">
      <div className="progress-bar__fill" style={{width: `${percent}%`}} />
    </div>
  </div>
));

ProgressBar.defaultProps = {
  icon: undefined,
};

export default ProgressBar;
