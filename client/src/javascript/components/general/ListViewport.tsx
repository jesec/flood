import {FixedSizeList} from 'react-window';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useMediaQuery} from '@react-hook/media-query';
import {useWindowSize} from '@react-hook/window-size';
import * as React from 'react';

import type {ListChildComponentProps} from 'react-window';

const Overflow = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  (props: React.ComponentProps<'div'>, ref) => {
    const {children, className, onScroll} = props;
    const osRef = React.useRef<OverlayScrollbarsComponent>(null);

    React.useEffect(() => {
      const scrollbarRef = osRef.current;

      if (scrollbarRef == null) {
        return () => {
          // do nothing.
        };
      }

      const viewport = scrollbarRef.osInstance()?.getElements().viewport as HTMLDivElement;

      const refCallback = ref as React.RefCallback<HTMLDivElement>;
      refCallback(viewport);

      if (onScroll) {
        viewport.addEventListener('scroll', (e) => onScroll((e as unknown) as React.UIEvent<HTMLDivElement>), {
          passive: true,
        });
      }

      return () => {
        if (onScroll) {
          viewport.removeEventListener('scroll', (e) => onScroll((e as unknown) as React.UIEvent<HTMLDivElement>));
        }
      };
    }, [onScroll]);

    return (
      <OverlayScrollbarsComponent
        {...props}
        options={{scrollbars: {autoHide: 'leave', clickScrolling: true}, className}}
        ref={osRef}>
        {children}
      </OverlayScrollbarsComponent>
    );
  },
);

interface ListViewportProps {
  className: string;
  itemRenderer: React.FC<ListChildComponentProps>;
  itemSize: number;
  listLength: number;
  outerRef?: React.RefCallback<HTMLDivElement>;
}

const ListViewport = React.forwardRef<FixedSizeList, ListViewportProps>((props: ListViewportProps, ref) => {
  const {className, itemRenderer, itemSize, listLength, outerRef} = props;
  const [windowWidth, windowHeight] = useWindowSize();
  const isDarkTheme = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <FixedSizeList
      className={`${className} ${isDarkTheme ? 'os-theme-light' : 'os-theme-dark'}`}
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
