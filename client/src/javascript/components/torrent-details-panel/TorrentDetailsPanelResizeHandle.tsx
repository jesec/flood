import {FC, useRef, useState} from 'react';
import {observer} from 'mobx-react';

import SettingActions from '@client/actions/SettingActions';
import SettingStore from '@client/stores/SettingStore';
import UIStore from '@client/stores/UIStore';

const pointerDownStyles = `
  body { user-select: none !important; }
  * { cursor: row-resize !important; }
`;

const TorrentDetailsPanelResizeHandle: FC = observer(() => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startY = useRef<number>();
  const initialHeight = useRef<number>();
  const resizeLine = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent) => {
    if (startY.current == null || initialHeight.current == null) {
      return;
    }

    const deltaY = startY.current - event.clientY;
    let newHeight = initialHeight.current + deltaY;

    // Constraints: Min 200px, max window.innerHeight - 200px
    const minHeight = 200;
    const maxHeight = window.innerHeight - 200;
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

    if (resizeLine.current != null) {
      resizeLine.current.style.transform = `translateY(${event.clientY}px)`;
    }

    // Update the height in real-time (just for visual feedback)
    document.documentElement.style.setProperty('--details-panel-height', `${newHeight}px`);
  };

  const handlePointerUp = () => {
    UIStore.removeGlobalStyle(pointerDownStyles);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointermove', handlePointerMove);

    setIsDragging(false);

    if (resizeLine.current != null) {
      resizeLine.current.style.opacity = '0';
      resizeLine.current.style.transform = '';
    }

    if (startY.current != null && initialHeight.current != null) {
      const deltaY = startY.current - (window.event as PointerEvent).clientY;
      let newHeight = initialHeight.current + deltaY;

      const minHeight = 200;
      const maxHeight = window.innerHeight - 200;
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      SettingActions.saveSetting('detailsPanelHeight', newHeight);
    }

    startY.current = undefined;
    initialHeight.current = undefined;
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!isDragging) {
      setIsDragging(true);

      startY.current = event.clientY;
      initialHeight.current = SettingStore.floodSettings.detailsPanelHeight || 400;

      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointermove', handlePointerMove);
      UIStore.addGlobalStyle(pointerDownStyles);

      if (resizeLine.current != null) {
        resizeLine.current.style.transform = `translateY(${event.clientY}px)`;
        resizeLine.current.style.opacity = '1';
      }
    }
  };

  return (
    <>
      <div className="torrent-details-panel-resize-handle" onPointerDown={handlePointerDown} />
      <div className="torrent-details-panel-resize-line" ref={resizeLine} />
    </>
  );
});

export default TorrentDetailsPanelResizeHandle;
