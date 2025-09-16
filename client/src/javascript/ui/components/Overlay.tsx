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
  isInteractive = true,
  isTransparent = false,
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

export default Overlay;
