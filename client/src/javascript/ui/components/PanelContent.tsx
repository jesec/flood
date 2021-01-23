import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface PanelContentProps {
  children: ReactNode;
  hasBorder?: boolean;
  borderPosition?: string;
}

const PanelContent: FC<PanelContentProps> = ({children, hasBorder, borderPosition}: PanelContentProps) => {
  const classes = classnames(`panel__content`, {
    [`panel__content--has-border--${borderPosition}`]: hasBorder,
  });

  return <div className={classes}>{children}</div>;
};

PanelContent.defaultProps = {
  hasBorder: false,
  borderPosition: 'top',
};

export default PanelContent;
