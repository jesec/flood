import classnames from 'classnames';
import {DndProvider} from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';
import {injectIntl} from 'react-intl';
import React from 'react';

import SortableListItem from './SortableListItem';

const methodsToBind = ['handleDrop', 'handleMove', 'handleMouseDown'];

class SortableList extends React.Component {
  constructor(props) {
    super(props);

    this.sortableListRef = null;
    this.state = {
      items: props.items,
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  static getDerivedStateFromProps(props) {
    return {items: props.items};
  }

  handleDrop() {
    if (this.props.onDrop) {
      this.props.onDrop(this.state.items);
    }
  }

  handleMouseDown(event) {
    if (this.props.onMouseDown) {
      this.props.onMouseDown(event);
    }
  }

  handleMove(dragIndex, hoverIndex) {
    const {items} = this.state;
    const draggedItem = items[dragIndex];

    // Remove the item being dragged.
    items.splice(dragIndex, 1);
    // Add the item being dragged in its new position.
    items.splice(hoverIndex, 0, draggedItem);

    this.setState({items});

    if (this.props.onMove) {
      this.props.onMove(items);
    }
  }

  getItemList() {
    const {
      handleDrop,
      handleMove,
      state: {items},
      props: {lockedIDs, isDraggable, renderItem},
    } = this;

    return items.map((item, index) => {
      const {id, visible} = item;

      return (
        <SortableListItem
          id={id}
          index={index}
          isLocked={lockedIDs.includes(id)}
          isDraggable={isDraggable}
          isVisible={visible}
          key={id}
          onDrop={handleDrop}
          onMove={handleMove}>
          {renderItem(item, index)}
        </SortableListItem>
      );
    });
  }

  render() {
    const classes = classnames('sortable-list', this.props.className);

    return (
      <ul
        className={classes}
        onMouseDown={this.handleMouseDown}
        ref={(ref) => {
          this.sortableListRef = ref;
        }}>
        {this.getItemList()}
      </ul>
    );
  }
}

const DndSortableList = (props) => {
  return (
    <DndProvider options={HTML5toTouch}>
      <SortableList {...props} />
    </DndProvider>
  );
};

export default injectIntl(DndSortableList);
