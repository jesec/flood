import {rgba} from 'polished';
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
}: OverlayProps) => (
  <div
    css={[
      {
        background: rgba('#1d2938', 0.95),
        bottom: 0,
        left: 0,
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 100,
      },
      isInteractive || {
        pointerEvents: 'none',
      },
      isTransparent && {
        background: 'transparent',
      },
      additionalClassNames,
    ]}
    onClickCapture={onClick}
    onContextMenuCapture={onContextMenu}
  >
    {children}
  </div>
);

Overlay.defaultProps = {
  additionalClassNames: undefined,
  isInteractive: true,
  isTransparent: false,
  onClick: undefined,
};

export default Overlay;
