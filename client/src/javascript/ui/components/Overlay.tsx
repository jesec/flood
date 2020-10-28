import classnames from 'classnames';
import * as React from 'react';

export interface OverlayProps {
  children?: React.ReactNode;
  additionalClassNames?: string;
  isInteractive?: boolean;
  isTransparent?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const Overlay: React.FC<OverlayProps> = ({
  children,
  additionalClassNames,
  onClick,
  isInteractive,
  isTransparent,
}: OverlayProps) => {
  const classes = classnames('overlay', additionalClassNames, {
    'overlay--no-interaction': !isInteractive,
    'overlay--transparent': isTransparent,
  });

  return (
    <div className={classes} onClickCapture={onClick}>
      {children}
    </div>
  );
};

Overlay.defaultProps = {
  additionalClassNames: undefined,
  isInteractive: true,
  isTransparent: false,
  onClick: undefined,
};

export default Overlay;
