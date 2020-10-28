import {FixedSizeList} from 'react-window';
import {useWindowHeight} from '@react-hook/window-size';
import * as React from 'react';

import type {ListChildComponentProps} from 'react-window';

interface ListViewportProps {
  className: string;
  itemRenderer: React.FC<ListChildComponentProps>;
  itemSize: number;
  listLength: number;
  outerRef?: React.RefCallback<HTMLDivElement>;
}

const ListViewport = React.forwardRef<FixedSizeList, ListViewportProps>((props: ListViewportProps, ref) => {
  const {className, itemRenderer, itemSize, listLength, outerRef} = props;
  const windowHeight = useWindowHeight();

  return (
    <FixedSizeList
      className={className}
      height={Math.max(itemSize * 30, windowHeight * 1.5)}
      itemCount={listLength}
      itemSize={itemSize}
      width="100%"
      innerElementType="ul"
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
