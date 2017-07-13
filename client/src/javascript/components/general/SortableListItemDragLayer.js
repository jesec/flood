import {DragLayer} from 'react-dnd';
import {FormattedMessage, injectIntl} from 'react-intl';
import React, {Component, PropTypes} from 'react';

import Checkbox from '../../components/general/form-elements/Checkbox';
import TorrentProperties from '../../constants/TorrentProperties';

const layerStyles = {
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(props) {
  const {clientOffset, differenceFromInitialOffset, listOffset} = props;

  if (!clientOffset || !listOffset) {
    return {display: 'none'};
  }

  const x = differenceFromInitialOffset.x;
  const y = clientOffset.y - listOffset.top - 15;

  return {transform: `translate(${x}px, ${y}px)`};
}

class SortableListItemDragLayer extends Component {
  renderItem(type, item) {
    switch (type) {
      case 'globally-draggable-item':
        return (
          <div className="sortable-list__item sortable-list__item--is-preview">
            <div className="sortable-list__content__wrapper">
              <span className="sortable-list__content sortable-list__content--primary">
                <FormattedMessage id={TorrentProperties[item.id].id}
                  defaultMessage={TorrentProperties[item.id].defaultMessage} />
              </span>
              <span className="sortable-list__content sortable-list__content--secondary">
                <Checkbox checked={item.isVisible}>
                  Enabled
                </Checkbox>
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  render() {
    const {item, itemType, isDragging} = this.props;

    if (!isDragging) {
      return null;
    }

    return (
      <div style={layerStyles}>
        <div style={getItemStyles(this.props)}>
          {this.renderItem(itemType, item)}
        </div>
      </div>
    );
  }
}

SortableListItemDragLayer.propTypes = {
  clientOffset: PropTypes.object,
  differenceFromInitialOffset: PropTypes.object,
  isDragging: PropTypes.bool.isRequired,
  item: PropTypes.object,
  itemType: PropTypes.string
};

export default DragLayer(monitor => ({
  clientOffset: monitor.getClientOffset(),
  differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
  isDragging: monitor.isDragging(),
  item: monitor.getItem(),
  itemType: monitor.getItemType()
}))(injectIntl(SortableListItemDragLayer));
