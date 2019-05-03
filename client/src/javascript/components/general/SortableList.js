import classnames from 'classnames';
import {DragDropContext} from 'react-dnd';
import {injectIntl} from 'react-intl';
import HTML5Backend from 'react-dnd-html5-backend';
import React from 'react';

import SortableListItemDragLayer from './SortableListItemDragLayer';
import SortableListItem from './SortableListItem';

const methodsToBind = ['handleDrop', 'handleMove', 'handleMouseDown'];

class SortableList extends React.Component {
  constructor(props) {
    super(props);

    this.sortableListRef = null;
    this.state = {
      listOffset: null,
      items: props.items,
    };

    methodsToBind.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({items: nextProps.items});
  }

  handleDrop() {
    if (this.props.onDrop) {
      this.props.onDrop(this.state.items);
    }
  }

  handleMouseDown(event) {
    if (this.sortableListRef != null) {
      this.setState({
        listOffset: this.sortableListRef.getBoundingClientRect(),
      });
    }

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
      props: {lockedIDs, renderItem},
    } = this;

    return items.map((item, index) => {
      const {id, visible} = item;

      return (
        <SortableListItem
          id={id}
          index={index}
          isLocked={lockedIDs.includes(id)}
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
        ref={ref => {
          this.sortableListRef = ref;
        }}>
        <SortableListItemDragLayer
          items={this.state.items}
          listOffset={this.state.listOffset}
          renderItem={this.props.renderItem}
        />
        {this.getItemList()}
      </ul>
    );
  }
}

export default DragDropContext(HTML5Backend)(injectIntl(SortableList));
