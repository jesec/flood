import {forwardRef, useCallback, useEffect, useRef, useState} from 'react';
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
  const hostElementRef = useRef<HTMLDivElement>(null);
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);

  const mergedRef = useCallback(
    (instance: ListImperativeAPI | null) => {
      setListElement(instance?.element ?? null);

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

  // react-window exposes its DOM element after the initial ref callback.
  useEffect(() => {
    const hostElement = hostElementRef.current;
    if (hostElement == null || listElement == null) return;

    const osInstance = OverlayScrollbars(
      {
        target: hostElement,
        elements: {
          viewport: listElement,
        },
      },
      {
        scrollbars: {
          autoHide: 'leave',
          clickScroll: true,
          theme: `os-theme-${ConfigStore.isPreferDark ? 'light' : 'dark'}`,
        },
      },
    );

    const dispose = reaction(
      () => ConfigStore.isPreferDark,
      (isDark) => {
        osInstance.options({
          scrollbars: {
            theme: `os-theme-${isDark ? 'light' : 'dark'}`,
          },
        });
      },
    );

    return () => {
      dispose();
      osInstance.destroy();
    };
  }, [listElement]);

  return (
    <div className={className} ref={hostElementRef} style={{height: Math.max(rowHeight * 30, 600), width: '100%'}}>
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
