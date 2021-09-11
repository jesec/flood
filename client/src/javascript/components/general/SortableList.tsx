import classnames from 'classnames';
import {HTML5toTouch} from 'rdndmb-html5-to-touch';
import {DndProvider} from 'react-dnd-multi-backend';
import {FC, MouseEvent, ReactNode, useState} from 'react';

import SortableListItem from './SortableListItem';

export type ListItem = {
  id: string;
  visible: boolean;
};

interface SortableListProps {
  id: string;
  className: string;
  lockedIDs: Array<string>;
  items: Array<ListItem>;
  renderItem: (item: ListItem, index: number) => ReactNode;
  onMouseDown?: (event: MouseEvent) => void;
  onMove?: (items: this['items']) => void;
  onDrop?: (items: this['items']) => void;
}

const SortableList: FC<SortableListProps> = ({
  className,
  id: listID,
  items,
  lockedIDs,
  renderItem,
  onMouseDown,
  onMove,
  onDrop,
}: SortableListProps) => {
  const [currentItems, setCurrentItems] = useState(items);
  const classes = classnames('sortable-list', className);

  return (
    <div
      css={{width: '100%'}}
      role="none"
      onMouseDown={(event) => {
        if (onMouseDown) {
          onMouseDown(event);
        }
      }}
    >
      <DndProvider options={HTML5toTouch}>
        <ul className={classes}>
          {currentItems.map((item, index) => {
            const {id, visible} = item;
            return (
              <SortableListItem
                list={listID}
                id={id}
                index={index}
                isLocked={lockedIDs.includes(id)}
                isVisible={visible}
                key={id}
                onDrop={() => {
                  if (onDrop) {
                    onDrop(currentItems);
                  }
                }}
                onMove={(dragIndex, hoverIndex) => {
                  const draggedItem = currentItems[dragIndex];

                  const newItems = currentItems.slice();

                  // Remove the item being dragged.
                  newItems.splice(dragIndex, 1);
                  // Add the item being dragged in its new position.
                  newItems.splice(hoverIndex, 0, draggedItem);

                  setCurrentItems(newItems);

                  if (onMove) {
                    onMove(newItems);
                  }
                }}
              >
                {renderItem(item, index)}
              </SortableListItem>
            );
          })}
        </ul>
      </DndProvider>
    </div>
  );
};

SortableList.defaultProps = {
  onMouseDown: undefined,
  onMove: undefined,
  onDrop: undefined,
};

export default SortableList;
