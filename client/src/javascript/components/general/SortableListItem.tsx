import classnames from 'classnames';
import {DragElementWrapper, DragPreviewOptions, DragSource, DragSourceOptions, DropTarget} from 'react-dnd';
import flow from 'lodash/flow';
import {getEmptyImage} from 'react-dnd-html5-backend';
import React from 'react';

import LockIcon from '../icons/LockIcon';

interface SortableListItemProps {
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

class SortableListItem extends React.Component<SortableListItemProps> {
  componentDidMount() {
    // Replace the native drag preview with an empty image.
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true,
    });
  }

  render() {
    const {children, isDragging, isLocked, connectDragSource, connectDropTarget} = this.props;

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
  }
}

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
