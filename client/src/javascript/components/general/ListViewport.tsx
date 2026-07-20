import {forwardRef, useCallback, useEffect, useRef} from 'react';
import {reaction} from 'mobx';
import {List} from 'react-window';
import {observer} from 'mobx-react-lite';
import {OverlayScrollbars} from 'overlayscrollbars';

import ConfigStore from '@client/stores/ConfigStore';

import type {ListImperativeAPI, RowComponentProps} from 'react-window';

interface ListViewportProps {
  className?: string;
  rowCount: number;
  rowComponent: (props: RowComponentProps) => React.ReactElement | null;
  rowHeight: number;
  listRef?: React.Ref<ListImperativeAPI>;
}

const ListViewport = forwardRef<ListImperativeAPI, ListViewportProps>((props: ListViewportProps, ref) => {
  const {className, rowCount, rowComponent, rowHeight, listRef} = props;
  const innerListRef = useRef<ListImperativeAPI | null>(null);
  const osInstanceRef = useRef<ReturnType<typeof OverlayScrollbars> | null>(null);

  const mergedRef = useCallback(
    (instance: ListImperativeAPI | null) => {
      innerListRef.current = instance;

      // Forward to listRef prop
      if (typeof listRef === 'function') {
        listRef(instance);
      } else if (listRef != null) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        (listRef as React.MutableRefObject<ListImperativeAPI | null>).current = instance;
      }

      // Forward to forwarded ref
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref != null) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        (ref as React.MutableRefObject<ListImperativeAPI | null>).current = instance;
      }
    },
    [listRef, ref],
  );

  // Initialize OverlayScrollbars on the List's outer DOM element after mount
  useEffect(() => {
    const element = innerListRef.current?.element;
    if (!element) return;

    const osInstance = OverlayScrollbars(element, {
      scrollbars: {
        autoHide: 'leave',
        clickScroll: true,
        theme: `os-theme-${ConfigStore.isPreferDark ? 'light' : 'dark'}`,
      },
    });
    osInstanceRef.current = osInstance;

    return () => {
      osInstance.destroy();
      osInstanceRef.current = null;
    };
  }, []);

  // Update scrollbar theme when dark/light mode changes
  useEffect(() => {
    const dispose = reaction(
      () => ConfigStore.isPreferDark,
      (isDark) => {
        osInstanceRef.current?.options({
          scrollbars: {
            autoHide: 'leave',
            clickScroll: true,
            theme: `os-theme-${isDark ? 'light' : 'dark'}`,
          },
        });
      },
    );
    return dispose;
  }, []);

  return (
    <div className={className} style={{height: Math.max(rowHeight * 30, 600), width: '100%'}}>
      <List
        defaultHeight={Math.max(rowHeight * 30, 600)}
        rowCount={rowCount}
        rowHeight={rowHeight}
        listRef={mergedRef}
        overscanCount={30}
        rowComponent={rowComponent}
        rowProps={{}}
      />
    </div>
  );
});

export default observer(ListViewport);
