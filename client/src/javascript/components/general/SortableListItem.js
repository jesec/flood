import _ from 'lodash';
import classnames from 'classnames';
import {DragSource, DropTarget} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import React from 'react';
import ReactDOM from 'react-dom';

import LockIcon from '../icons/LockIcon';

const itemSource = {
  beginDrag({id, index, isVisible}) {
    return {id, index, isVisible};
  },

  canDrag({isLocked}) {
    return !isLocked;
  },
};

const itemTarget = {
  drop(props) {
    if (props.onDrop) {
      props.onDrop();
    }
  },

  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const {index: hoverIndex, isLocked} = props;

    // Don't replace items with themselves
    if (isLocked || dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    // TODO: Add ref to component and use instead of findDOMNode
    // eslint-disable-next-line react/no-find-dom-node
    const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get the remaining pixels to the top of the list.
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    const isDraggingUp = dragIndex < hoverIndex;
    const isDraggingDown = dragIndex > hoverIndex;

    const dragThreshhold = isDraggingDown ? hoverBoundingRect.height * 0.85 : hoverBoundingRect.height * 0.15;

    // Return early if we haven't dragged more than halfway past the next item.
    if ((isDraggingUp && hoverClientY < dragThreshhold) || (isDraggingDown && hoverClientY > dragThreshhold)) {
      return;
    }

    props.onMove(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  },
};

class SortableListItem extends React.Component {
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

export default _.flow([
  DragSource('globally-draggable-item', itemSource, (connect, monitor) => ({
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  })),
  DropTarget('globally-draggable-item', itemTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
  })),
])(SortableListItem);
