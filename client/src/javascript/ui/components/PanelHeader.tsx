import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface PanelHeaderProps {
  children: ReactNode;
  hasBorder?: boolean;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const PanelHeader: FC<PanelHeaderProps> = ({children, hasBorder, level}: PanelHeaderProps) => {
  const classes = classnames(`panel__header panel__header--level-${level}`, {
    'panel__header--has-border': hasBorder,
  });

  return <div className={classes}>{children}</div>;
};

PanelHeader.defaultProps = {
  hasBorder: false,
  level: 1,
};

export default PanelHeader;
