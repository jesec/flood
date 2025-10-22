import classnames from 'classnames';
import {FC, ReactNode} from 'react';
import ConfigStore from '@client/stores/ConfigStore';

interface PanelProps {
  children: ReactNode;
  spacing?: 'small' | 'medium' | 'large';
  transparent?: boolean;
}

const Panel: FC<PanelProps> = ({children, spacing = 'medium', transparent = false}: PanelProps) => {
  const classes = classnames(`panel`, `panel--${spacing}`, {
    'panel--transparent': transparent,
    inverse: ConfigStore.isPreferDark,
  });

  return <div className={classes}>{children}</div>;
};

export default Panel;
