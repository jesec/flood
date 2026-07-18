import {forwardRef} from 'react';
import {List} from 'react-window';
import {observer} from 'mobx-react-lite';

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

  return (
    <div className={className} style={{height: Math.max(rowHeight * 30, 600), width: '100%'}}>
      <List
        defaultHeight={Math.max(rowHeight * 30, 600)}
        rowCount={rowCount}
        rowHeight={rowHeight}
        listRef={listRef ?? ref}
        overscanCount={30}
        rowComponent={rowComponent}
        rowProps={{}}
      />
    </div>
  );
});

export default observer(ListViewport);
