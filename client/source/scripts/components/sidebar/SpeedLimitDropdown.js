import React from 'react';

import ClientActions from '../../actions/ClientActions';
import ClientDataStore from '../../stores/ClientDataStore';
import Dropdown from '../generic/Dropdown';
import EventTypes from '../../constants/EventTypes';
import Icon from '../icons/Icon';

const METHODS_TO_BIND = ['onTransferDataRequestSuccess'];
const SPEEDS = [1024, 10240, 102400, 1048576, 2097152, 5242880, 10485760, 0];

class Sidebar extends React.Component {
  constructor() {
    super();

    this.state = {
      throttle: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    ClientDataStore.listen(
      EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS,
      this.onTransferDataRequestSuccess
    );
    ClientDataStore.fetchTransferData();
  }

  componentWillUnmount() {
    ClientDataStore.unlisten(
      EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS,
      this.onTransferDataRequestSuccess
    );
  }

  onTransferDataRequestSuccess() {
    this.setState({
      throttle: ClientDataStore.getThrottles({latest: true})
    });
  }

  getDropdownHeader() {
    return (
      <a className="client-stats client-stat--limits">
        <Icon icon="limits" /> Speed Limits
      </a>
    );
  }

  getHumanReadableSpeed(bytes) {
    if (bytes === 0) {
      return 'Unlimited';
    } else if (bytes < 1048576) {
      return <span>{bytes / 1024}<em className="unit">kB/s</em></span>;
    } else {
      return <span>{bytes / 1024 / 1024}<em className="unit">MB/s</em></span>;
    }
  }

  getSpeedList(property) {
    let heading = {
      className: `dropdown__label dropdown__label--${property}`,
      displayName: `${property.charAt(0).toUpperCase()}${property.slice(1)}`,
      selectable: false,
      value: null
    };

    let insertCurrentThrottle = true;
    let currentThrottle = this.state.throttle;

    let items = SPEEDS.map((bytes) => {
      let selected = false;
      if (currentThrottle && currentThrottle[property] === bytes) {
        if (property === 'upload') {
          console.log('current: ', currentThrottle[property], property);
        }
        selected = true;
        insertCurrentThrottle = false;
      }
      return {
        displayName: this.getHumanReadableSpeed(bytes),
        property,
        selected,
        selectable: true,
        value: bytes
      };
    });

    if (insertCurrentThrottle && currentThrottle) {
      let insertionPoint = _.sortedIndex(SPEEDS, currentThrottle[property]);

      items.splice(insertionPoint, 0, {
        displayName: this.getHumanReadableSpeed(currentThrottle[property]),
        property: property,
        selectable: true,
        value: currentThrottle[property]
      });
    }

    items.unshift(heading);

    return items;
  }

  getDropdownLists() {
    return [this.getSpeedList('upload'), this.getSpeedList('download')];
  }

  handleItemSelect(data) {
    ClientActions.setThrottle(data.property, data.value);
  }

  render() {
    return (
      <div className="client-stats sidebar__item sidebar__item--speed-limit">
        <Dropdown
          handleItemSelect={this.handleItemSelect}
          header={this.getDropdownHeader()}
          menuItems={this.getDropdownLists()}
          />
      </div>
    );
  }
}

export default Sidebar;
