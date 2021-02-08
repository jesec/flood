import {ComponentProps, FC, forwardRef, RefCallback, UIEvent, useEffect, useRef} from 'react';
import {FixedSizeList} from 'react-window';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useWindowSize} from 'react-use';

import type {ListChildComponentProps} from 'react-window';

import ConfigStore from '../../stores/ConfigStore';

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
      viewport.addEventListener('scroll', (e) => onScroll((e as unknown) as UIEvent<HTMLDivElement>), {
        passive: true,
      });
    }

    return () => {
      if (onScroll) {
        viewport.removeEventListener('scroll', (e) => onScroll((e as unknown) as UIEvent<HTMLDivElement>));
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

interface ListViewportProps {
  className: string;
  itemRenderer: FC<ListChildComponentProps>;
  itemSize: number;
  listLength: number;
  outerRef?: RefCallback<HTMLDivElement>;
}

const ListViewport = forwardRef<FixedSizeList, ListViewportProps>((props: ListViewportProps, ref) => {
  const {className, itemRenderer, itemSize, listLength, outerRef} = props;
  const {height: windowHeight, width: windowWidth} = useWindowSize();

  return (
    <FixedSizeList
      className={`${className} ${ConfigStore.isPreferDark ? 'os-theme-light' : 'os-theme-dark'}`}
      height={Math.max(itemSize * 30, windowHeight * 1.5)}
      itemCount={listLength}
      itemSize={itemSize}
      width="100%"
      innerElementType="ul"
      outerElementType={windowWidth > 720 ? Overflow : undefined} // Don't use custom scrollbar on smaller screens
      ref={ref}
      outerRef={outerRef}>
      {itemRenderer}
    </FixedSizeList>
  );
});

ListViewport.defaultProps = {
  outerRef: undefined,
};

export default ListViewport;
