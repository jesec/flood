import React from 'react';
import { injectIntl, formatMessage, FormattedMessage } from 'react-intl';

import ClientActions from '../../actions/ClientActions';
import Dropdown from '../General/FormElements/Dropdown';
import EventTypes from '../../constants/EventTypes';
import format from '../../util/formatData';
import LimitsIcon from '../Icons/Limits';
import SidebarItem from '../Sidebar/SidebarItem';
import SettingsStore from '../../stores/SettingsStore';
import TransferDataStore from '../../stores/TransferDataStore';

const METHODS_TO_BIND = ['handleSettingsFetchRequestSuccess', 'onTransferDataRequestSuccess'];

class SpeedLimitDropdown extends React.Component {
  constructor() {
    super();

    this.state = {
      speedLimits: SettingsStore.getFloodSettings('speedLimits'),
      throttle: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    SettingsStore.listen(EventTypes.SETTINGS_CHANGE,
      this.handleSettingsFetchRequestSuccess);
    TransferDataStore.listen(EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS,
      this.onTransferDataRequestSuccess);
    TransferDataStore.fetchTransferData();
  }

  componentWillUnmount() {
    SettingsStore.unlisten(EventTypes.SETTINGS_CHANGE,
      this.handleSettingsFetchRequestSuccess);
    TransferDataStore.unlisten(EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS,
      this.onTransferDataRequestSuccess);
  }

  onTransferDataRequestSuccess() {
    this.setState({throttle: TransferDataStore.getThrottles({latest: true})});
  }

  getDropdownHeader() {
    return (
      <a className="sidebar__icon-button sidebar__icon-button--limits">
        <LimitsIcon /> <FormattedMessage
          id="sidebar.speedlimits_button"
          defaultMessage="Speed Limits"
        />
      </a>
    );
  }

  getHumanReadableSpeed(bytes) {
    if (bytes === 0) {
      return this.props.intl.formatMessage({
        id: 'speed.unlimited',
        defaultMessage: 'Unlimited'
      });
    } else {
      let formattedData = format.data(bytes, '/s', 1, {padded: false});
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
    let speeds = this.state.speedLimits[property];

    let items = speeds.map((bytes) => {
      let selected = false;
      bytes = Number(bytes);

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
      let insertionPoint = _.sortedIndex(speeds, currentThrottle[property]);

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

  handleSettingsFetchRequestSuccess() {
    let speedLimits = SettingsStore.getFloodSettings('speedLimits');

    if (!!speedLimits) {
      this.setState({speedLimits});
    }
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

export default injectIntl(SpeedLimitDropdown);
