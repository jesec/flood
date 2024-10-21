import classnames from 'classnames';
import {FC, ReactNode} from 'react';
import ConfigStore from '@client/stores/ConfigStore';

interface PanelProps {
  children: ReactNode;
  spacing?: 'small' | 'medium' | 'large';
  transparent?: boolean;
}

const Panel: FC<PanelProps> = ({children, spacing, transparent}: PanelProps) => {
  const classes = classnames(`panel`, `panel--${spacing}`, {
    'panel--transparent': transparent,
    inverse: ConfigStore.isPreferDark,
  });

  return <div className={classes}>{children}</div>;
};

Panel.defaultProps = {
  spacing: 'medium',
  transparent: false,
};

export default Panel;
