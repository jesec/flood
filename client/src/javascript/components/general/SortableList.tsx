import classnames from 'classnames';
import {DndProvider} from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import SortableListItem from './SortableListItem';

export type ListItem = {
  id: string;
  visible: boolean;
};

interface SortableListProps extends WrappedComponentProps {
  id: string;
  className: string;
  lockedIDs: Array<string>;
  items: Array<ListItem>;
  isDraggable?: boolean;
  renderItem: (item: ListItem, index: number) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLUListElement>) => void;
  onMove?: (items: this['items']) => void;
  onDrop?: (items: this['items']) => void;
}

interface SortableListStates {
  items: SortableListProps['items'];
}

const METHODS_TO_BIND = ['handleDrop', 'handleMove', 'handleMouseDown'] as const;

class SortableList extends React.Component<SortableListProps, SortableListStates> {
  sortableListRef: HTMLUListElement | null = null;

  constructor(props: SortableListProps) {
    super(props);

    this.state = {
      items: props.items,
    };

    METHODS_TO_BIND.forEach(<T extends typeof METHODS_TO_BIND[number]>(methodName: T) => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  static getDerivedStateFromProps(props: SortableListProps) {
    return {items: props.items};
  }

  getItemList() {
    const {
      handleDrop,
      handleMove,
      state: {items},
      props: {id: listID, lockedIDs, isDraggable, renderItem},
    } = this;

    return items.map((item, index) => {
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
          onDrop={handleDrop}
          onMove={handleMove}>
          {renderItem(item, index)}
        </SortableListItem>
      );
    });
  }

  handleDrop() {
    const {onDrop} = this.props;
    if (onDrop) {
      onDrop(this.state.items);
    }
  }

  handleMouseDown(event: React.MouseEvent<HTMLUListElement>) {
    const {onMouseDown} = this.props;
    if (onMouseDown) {
      onMouseDown(event);
    }
  }

  handleMove(dragIndex: number, hoverIndex: number) {
    const {onMove} = this.props;
    const {items} = this.state;
    const draggedItem = items[dragIndex];

    // Remove the item being dragged.
    items.splice(dragIndex, 1);
    // Add the item being dragged in its new position.
    items.splice(hoverIndex, 0, draggedItem);

    this.setState({items});

    if (onMove) {
      onMove(items);
    }
  }

  render() {
    const {className} = this.props;
    const classes = classnames('sortable-list', className);

    return (
      <DndProvider options={HTML5toTouch}>
        <ul
          className={classes}
          onMouseDown={this.handleMouseDown}
          ref={(ref) => {
            this.sortableListRef = ref;
          }}>
          {this.getItemList()}
        </ul>
      </DndProvider>
    );
  }
}

export default injectIntl(SortableList);
