import {DragLayer} from 'react-dnd';
import {injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

const layerStyles = {
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

class SortableListItemDragLayer extends Component {
  static propTypes = {
    clientOffset: PropTypes.object,
    differenceFromInitialOffset: PropTypes.object,
    isDragging: PropTypes.bool.isRequired,
    item: PropTypes.object,
  };

  getItemStyles = () => {
    const {clientOffset, differenceFromInitialOffset, listOffset} = this.props;

    if (!clientOffset || !listOffset) {
      return {display: 'none'};
    }

    const {x} = differenceFromInitialOffset;
    const y = clientOffset.y - listOffset.top - 15;

    return {transform: `translate(${x}px, ${y}px)`};
  };

  render() {
    const {item, isDragging} = this.props;

    if (!isDragging) {
      return null;
    }

    return (
      <div style={layerStyles}>
        <div style={this.getItemStyles()}>{this.props.renderItem({...item, dragIndicator: true})}</div>
      </div>
    );
  }
}

export default DragLayer(monitor => ({
  clientOffset: monitor.getClientOffset(),
  differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
  isDragging: monitor.isDragging(),
  item: monitor.getItem(),
}))(injectIntl(SortableListItemDragLayer));
