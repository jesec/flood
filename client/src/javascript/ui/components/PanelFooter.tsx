import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface PanelFooterProps {
  children: ReactNode;
  hasBorder?: boolean;
}

const PanelFooter: FC<PanelFooterProps> = ({children, hasBorder = false}: PanelFooterProps) => {
  const classes = classnames('panel__footer', {
    'panel__footer--has-border': hasBorder,
  });

  return <div className={classes}>{children}</div>;
};

export default PanelFooter;
