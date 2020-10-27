import React from 'react';

interface ListViewportProps {
  children?: React.ReactNode;
  itemRenderer: (index: number) => React.ReactNode;
  listClass: string;
  listLength: number;
  onScroll?: () => void;
}

// TODO: Implement windowing or infinite scrolling
const ListViewport = React.forwardRef<HTMLDivElement, ListViewportProps>((props: ListViewportProps, ref) => {
  const {children, listClass, listLength, itemRenderer, onScroll} = props;

  const list = [];

  // For loops are fast, and performance matters here.
  for (let index = 0; index < listLength; index += 1) {
    list.push(itemRenderer(index));
  }

  const listContent = <ul className={listClass}>{list}</ul>;

  return (
    <div className="torrent__list__viewport" onScroll={onScroll} ref={ref}>
      {children}
      {listContent}
    </div>
  );
});

ListViewport.defaultProps = {
  children: undefined,
  onScroll: undefined,
};

export default ListViewport;
