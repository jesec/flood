import {FC, useCallback, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';

import SettingActions from '@client/actions/SettingActions';
import UIStore from '@client/stores/UIStore';

const pointerDownStyles = `
  body { user-select: none !important; }
  * { cursor: row-resize !important; }
`;

const MIN_PANEL_HEIGHT = 200;
const WINDOW_PADDING = 200;

interface TorrentDetailsPanelResizeHandleProps {
  height: number;
  onHeightChange: (height: number) => void;
}

const getConstrainedHeight = (initialHeight: number, startY: number, currentY: number) => {
  const deltaY = startY - currentY;
  const maxHeight = window.innerHeight - WINDOW_PADDING;

  return Math.max(MIN_PANEL_HEIGHT, Math.min(maxHeight, initialHeight + deltaY));
};

const TorrentDetailsPanelResizeHandle: FC<TorrentDetailsPanelResizeHandleProps> = observer(
  ({height, onHeightChange}) => {
    const [dragLineY, setDragLineY] = useState<number>();
    const startY = useRef<number>();
    const initialHeight = useRef<number>();

    const isDragging = dragLineY != null;

    const resetDragState = useCallback(() => {
      setDragLineY(undefined);
      startY.current = undefined;
      initialHeight.current = undefined;
    }, []);

    const updatePanelHeight = useCallback(
      (currentY: number) => {
        if (startY.current == null || initialHeight.current == null) {
          return undefined;
        }

        const newHeight = getConstrainedHeight(initialHeight.current, startY.current, currentY);

        setDragLineY(currentY);
        onHeightChange(newHeight);

        return newHeight;
      },
      [onHeightChange],
    );

    const handlePointerMove = useCallback(
      (event: PointerEvent) => {
        updatePanelHeight(event.clientY);
      },
      [updatePanelHeight],
    );

    const handlePointerUp = useCallback(
      (event: PointerEvent) => {
        const newHeight = updatePanelHeight(event.clientY);

        if (newHeight != null) {
          SettingActions.saveSetting('detailsPanelHeight', newHeight);
        }

        resetDragState();
      },
      [resetDragState, updatePanelHeight],
    );

    useEffect(() => {
      if (!isDragging) {
        return undefined;
      }

      UIStore.addGlobalStyle(pointerDownStyles);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointermove', handlePointerMove);

      return () => {
        UIStore.removeGlobalStyle(pointerDownStyles);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointermove', handlePointerMove);
      };
    }, [handlePointerMove, handlePointerUp, isDragging]);

    const handlePointerDown = (event: React.PointerEvent) => {
      event.preventDefault();

      if (isDragging) {
        return;
      }

      startY.current = event.clientY;
      initialHeight.current = height;
      setDragLineY(event.clientY);
    };

    return (
      <>
        <div className="torrent-details-panel-resize-handle" onPointerDown={handlePointerDown} />
        <div
          className="torrent-details-panel-resize-line"
          style={{
            opacity: isDragging ? 1 : 0,
            transform: dragLineY == null ? undefined : `translateY(${dragLineY}px)`,
          }}
        />
      </>
    );
  },
);

export default TorrentDetailsPanelResizeHandle;
