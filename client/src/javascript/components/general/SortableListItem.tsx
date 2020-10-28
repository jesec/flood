import classnames from 'classnames';
import {DragElementWrapper, DragPreviewOptions, DragSource, DragSourceOptions, DropTarget} from 'react-dnd';
import flow from 'lodash/flow';
import {getEmptyImage} from 'react-dnd-html5-backend';
import * as React from 'react';

import LockIcon from '../icons/LockIcon';

interface SortableListItemProps {
  children?: React.ReactNode;
  list: string;
  id: string;
  index: number;
  isVisible: boolean;
  isDragging: boolean;
  isLocked: boolean;
  isDraggable: boolean;
  onDrop: () => void;
  onMove: (sourceIndex: number, targetIndex: number) => void;
  connectDragPreview: DragElementWrapper<DragPreviewOptions>;
  connectDragSource: DragElementWrapper<DragSourceOptions>;
  connectDropTarget: DragElementWrapper<never>;
}

const SortableListItem: React.FC<SortableListItemProps> = (props: SortableListItemProps) => {
  const {children, isDragging, isLocked, connectDragPreview, connectDragSource, connectDropTarget} = props;

  React.useEffect(() => {
    connectDragPreview(getEmptyImage(), {
      captureDraggingState: true,
    });
  });

  let lockedIcon = null;

  if (isLocked) {
    lockedIcon = <LockIcon />;
  }

  const classes = classnames('sortable-list__item', {
    'sortable-list__item--is-dragging': isDragging,
    'sortable-list__item--is-locked': isLocked,
  });

  return connectDragSource(
    connectDropTarget(
      <div className={classes}>
        {lockedIcon}
        {children}
      </div>,
    ),
  );
};

export default flow([
  DragSource(
    'globally-draggable-item',
    {
      beginDrag({list, id, index, isVisible}: SortableListItemProps) {
        return {list, id, index, isVisible};
      },

      canDrag({isLocked, isDraggable}: SortableListItemProps) {
        if (isDraggable != null) {
          return isDraggable;
        }

        if (isLocked) {
          return false;
        }

        return true;
      },
    },
    (connect, monitor) => ({
      connectDragPreview: connect.dragPreview(),
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
    }),
  ),
  DropTarget(
    'globally-draggable-item',
    {
      drop({onDrop}: SortableListItemProps) {
        if (onDrop) {
          onDrop();
        }
      },

      hover(props, monitor) {
        const item: SortableListItemProps = monitor.getItem();

        // Don't replace items with themselves
        if (props.isLocked || item.index === props.index) {
          return;
        }

        // Don't drop item to another list
        if (item.list !== props.list) {
          return;
        }

        props.onMove(item.index, props.index);
        item.index = props.index;
      },
    },
    (connect) => ({
      connectDropTarget: connect.dropTarget(),
    }),
  ),
])(SortableListItem);
