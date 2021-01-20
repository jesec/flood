import classnames from 'classnames';
import {DndProvider} from 'react-dnd-multi-backend';
import {FC, MouseEvent, ReactNode, useState} from 'react';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';

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
  isDraggable?: boolean;
  renderItem: (item: ListItem, index: number) => ReactNode;
  onMouseDown?: (event: MouseEvent<HTMLUListElement>) => void;
  onMove?: (items: this['items']) => void;
  onDrop?: (items: this['items']) => void;
}

const SortableList: FC<SortableListProps> = ({
  className,
  id: listID,
  items,
  lockedIDs,
  isDraggable,
  renderItem,
  onMouseDown,
  onMove,
  onDrop,
}: SortableListProps) => {
  const [currentItems, setCurrentItems] = useState(items);
  const classes = classnames('sortable-list', className);

  return (
    <DndProvider options={HTML5toTouch}>
      <ul
        className={classes}
        onMouseDown={(event) => {
          if (onMouseDown) {
            onMouseDown(event);
          }
        }}>
        {currentItems.map((item, index) => {
          const {id, visible} = item;
          return (
            <SortableListItem
              list={listID}
              id={id}
              index={index}
              isLocked={lockedIDs.includes(id)}
              isDraggable={isDraggable}
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
              }}>
              {renderItem(item, index)}
            </SortableListItem>
          );
        })}
      </ul>
    </DndProvider>
  );
};

SortableList.defaultProps = {
  isDraggable: undefined,
  onMouseDown: undefined,
  onMove: undefined,
  onDrop: undefined,
};

export default SortableList;
