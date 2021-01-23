import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface PanelProps {
  children: ReactNode;
  theme?: 'light' | 'dark';
  spacing?: 'small' | 'medium' | 'large';
  transparent?: boolean;
}

const Panel: FC<PanelProps> = ({children, theme, spacing, transparent}: PanelProps) => {
  const classes = classnames(`panel panel--${theme}`, `panel--${spacing}`, {
    'panel--transparent': transparent,
  });

  return <div className={classes}>{children}</div>;
};

Panel.defaultProps = {
  theme: 'light',
  spacing: 'medium',
  transparent: false,
};

export default Panel;
