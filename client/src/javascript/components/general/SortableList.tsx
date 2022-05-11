import {arrayMove, SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';
import classnames from 'classnames';
import {DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor} from '@dnd-kit/core';
import {FC, MouseEvent, ReactNode, useState} from 'react';
import {restrictToParentElement, restrictToVerticalAxis} from '@dnd-kit/modifiers';

import SortableListItem from './SortableListItem';

interface SortableListProps {
  className: string;
  lockedIDs: Array<string>;
  items: string[];
  renderItem: (id: string, index: number) => ReactNode;
  onMouseDown?: (event: MouseEvent) => void;
  onDrop?: (items: this['items']) => void;
}

const SortableList: FC<SortableListProps> = ({
  className,
  items,
  lockedIDs,
  renderItem,
  onMouseDown,
  onDrop,
}: SortableListProps) => {
  const [currentItems, setCurrentItems] = useState(items);
  const classes = classnames('sortable-list', className);

  const keyboardSensor = useSensor(KeyboardSensor);
  const mouseSensor = useSensor(MouseSensor, {activationConstraint: {distance: 10}});
  const touchSensor = useSensor(TouchSensor, {activationConstraint: {distance: 10}});

  return (
    <div
      css={{width: '100%', touchAction: 'none'}}
      role="none"
      onMouseDown={(event) => {
        if (onMouseDown) {
          onMouseDown(event);
        }
      }}
    >
      <DndContext
        sensors={[keyboardSensor, mouseSensor, touchSensor]}
        onDragEnd={({active, over}) => {
          if (over == null) {
            return;
          }

          if (active.id === over.id) {
            return;
          }

          const newItems = arrayMove(
            items,
            items.findIndex((id) => id === active.id),
            items.findIndex((id) => id === over.id),
          );

          setCurrentItems(newItems);

          if (onDrop) {
            onDrop(newItems);
          }
        }}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        autoScroll={false}
      >
        <SortableContext items={currentItems} strategy={verticalListSortingStrategy}>
          <ul className={classes}>
            {currentItems.map((id, index) => {
              return (
                <SortableListItem id={id} disabled={lockedIDs.includes(id)} key={id}>
                  {renderItem(id, index)}
                </SortableListItem>
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
};

SortableList.defaultProps = {
  onMouseDown: undefined,
  onDrop: undefined,
};

export default SortableList;
