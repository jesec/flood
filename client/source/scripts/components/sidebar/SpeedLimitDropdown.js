import React from 'react';

import ClientActions from '../../actions/ClientActions';
import ClientDataStore from '../../stores/ClientDataStore';
import Dropdown from '../forms/Dropdown';
import EventTypes from '../../constants/EventTypes';
import format from '../../util/formatData';
import Limits from '../icons/Limits';
import SidebarItem from '../sidebar/SidebarItem';

const METHODS_TO_BIND = ['onTransferDataRequestSuccess'];
const SPEEDS = [1024, 10240, 102400, 512000, 1048576, 2097152, 5242880, 10485760, 0];

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
      <a className="client-stat--limits">
        <Limits /> Speed Limits
      </a>
    );
  }

  getHumanReadableSpeed(bytes) {
    if (bytes === 0) {
      return 'Unlimited';
    } else {
      let formattedData = format.data(bytes, '/s', 0);
      return (
        <span>
          {formattedData.value}
          <em className="unit">{formattedData.unit}</em>
        </span>
      );
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

      // Check if the current throttle setting exists in the preset speeds list.
      // Determine if we need to add the current throttle setting to the menu.
      if (currentThrottle && currentThrottle[property] === bytes) {
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

    // If the current throttle setting doesn't exist in the pre-set speeds list,
    // add it and show it as selected.
    if (insertCurrentThrottle && currentThrottle) {
      // Find the position to insert the current throttle setting so that it
      // remains sorted from lowest to highest.
      let insertionPoint = _.sortedIndex(SPEEDS, currentThrottle[property]);

      items.splice(insertionPoint, 0, {
        displayName: this.getHumanReadableSpeed(currentThrottle[property]),
        property: property,
        selected: true,
        selectable: true,
        value: currentThrottle[property]
      });
    }

    items.unshift(heading);

    return items;
  }

  getDropdownMenus() {
    return [this.getSpeedList('download'), this.getSpeedList('upload')];
  }

  handleItemSelect(data) {
    ClientActions.setThrottle(data.property, data.value);
  }

  render() {
    return (
      <SidebarItem modifier="speed-limit">
        <Dropdown
          handleItemSelect={this.handleItemSelect}
          header={this.getDropdownHeader()}
          menuItems={this.getDropdownMenus()}
          />
      </SidebarItem>
    );
  }
}

export default Sidebar;
