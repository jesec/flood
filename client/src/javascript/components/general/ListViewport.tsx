import {ComponentProps, FC, forwardRef, RefCallback, UIEvent, useEffect, useRef} from 'react';
import {FixedSizeList} from 'react-window';
import {observer} from 'mobx-react';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useWindowSize} from 'react-use';

import ConfigStore from '@client/stores/ConfigStore';

import type {FixedSizeListProps, ListChildComponentProps} from 'react-window';

const Overflow = forwardRef<HTMLDivElement, ComponentProps<'div'>>((props: ComponentProps<'div'>, ref) => {
  const {children, className, onScroll} = props;
  const osRef = useRef<OverlayScrollbarsComponent>(null);

  useEffect(() => {
    const scrollbarRef = osRef.current;

    if (scrollbarRef == null) {
      return () => {
        // do nothing.
      };
    }

    const viewport = scrollbarRef.osInstance()?.getElements().viewport as HTMLDivElement;

    const refCallback = ref as RefCallback<HTMLDivElement>;
    refCallback(viewport);

    if (onScroll) {
      viewport.addEventListener('scroll', (e) => onScroll(e as unknown as UIEvent<HTMLDivElement>), {
        passive: true,
      });
    }

    return () => {
      if (onScroll) {
        viewport.removeEventListener('scroll', (e) => onScroll(e as unknown as UIEvent<HTMLDivElement>));
      }
    };
  }, [onScroll, ref]);

  return (
    <OverlayScrollbarsComponent
      {...props}
      options={{
        scrollbars: {autoHide: 'leave', clickScrolling: true},
        className,
      }}
      ref={osRef}>
      {children}
    </OverlayScrollbarsComponent>
  );
});

interface ListViewportProps
  extends Pick<FixedSizeListProps, 'className' | 'itemCount' | 'itemKey' | 'itemSize' | 'outerRef'> {
  itemRenderer: FC<ListChildComponentProps>;
}

const ListViewport = forwardRef<FixedSizeList, ListViewportProps>((props: ListViewportProps, ref) => {
  const {className, itemCount, itemKey, itemRenderer, itemSize, outerRef} = props;
  const {height: windowHeight} = useWindowSize();

  return (
    <FixedSizeList
      className={`${className} ${ConfigStore.isPreferDark ? 'os-theme-light' : 'os-theme-dark'}`}
      height={Math.max(itemSize * 30, windowHeight)}
      itemCount={itemCount}
      itemKey={itemKey}
      itemSize={itemSize}
      width="100%"
      outerElementType={ConfigStore.isSmallScreen ? undefined : Overflow} // Don't use custom scrollbar on smaller screens
      ref={ref}
      overscanCount={30}
      outerRef={outerRef}>
      {itemRenderer}
    </FixedSizeList>
  );
});

export default observer(ListViewport);
