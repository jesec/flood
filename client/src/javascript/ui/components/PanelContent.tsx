import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface PanelContentProps {
  children: ReactNode;
  hasBorder?: boolean;
  borderPosition?: string;
}

const PanelContent: FC<PanelContentProps> = ({
  children,
  hasBorder = false,
  borderPosition = 'top',
}: PanelContentProps) => {
  const classes = classnames(`panel__content`, {
    [`panel__content--has-border--${borderPosition}`]: hasBorder,
  });

  return <div className={classes}>{children}</div>;
};

export default PanelContent;
