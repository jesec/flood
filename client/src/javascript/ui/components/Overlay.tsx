import classnames from 'classnames';
import {FC, MouseEvent, ReactNode} from 'react';

export interface OverlayProps {
  children?: ReactNode;
  additionalClassNames?: string;
  isInteractive?: boolean;
  isTransparent?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;
}

const Overlay: FC<OverlayProps> = ({
  children,
  additionalClassNames,
  onClick,
  onContextMenu,
  isInteractive,
  isTransparent,
}: OverlayProps) => {
  const classes = classnames('overlay', additionalClassNames, {
    'overlay--no-interaction': !isInteractive,
    'overlay--transparent': isTransparent,
  });

  return (
    <div className={classes} onClickCapture={onClick} onContextMenuCapture={onContextMenu}>
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
