import _ from 'lodash';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import ClientActions from '../../actions/ClientActions';
import Dropdown from '../general/form-elements/Dropdown';
import EventTypes from '../../constants/EventTypes';
import LimitsIcon from '../icons/Limits';
import SettingsStore from '../../stores/SettingsStore';
import Size from '../general/Size';
import Tooltip from '../general/Tooltip';
import TransferDataStore from '../../stores/TransferDataStore';

const MESSAGES = defineMessages({
  speedLimits: {
    defaultMessage: 'Speed Limits',
    id: 'sidebar.button.speedlimits',
  },
  unlimited: {
    defaultMessage: 'Unlimited',
    id: 'speed.unlimited',
  },
});
const METHODS_TO_BIND = ['handleDropdownOpen', 'handleSettingsFetchRequestSuccess', 'onTransferSummaryChange'];

class SpeedLimitDropdown extends React.Component {
  constructor() {
    super();

    this.state = {
      speedLimits: SettingsStore.getFloodSettings('speedLimits'),
      currentThrottles: {
        download: null,
        upload: null,
      },
    };
    this.tooltip = null;

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    SettingsStore.listen(EventTypes.SETTINGS_CHANGE, this.handleSettingsFetchRequestSuccess);
    TransferDataStore.listen(EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE, this.onTransferSummaryChange);
  }

  componentWillUnmount() {
    SettingsStore.unlisten(EventTypes.SETTINGS_CHANGE, this.handleSettingsFetchRequestSuccess);
    TransferDataStore.unlisten(EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE, this.onTransferSummaryChange);
  }

  onTransferSummaryChange() {
    const transferSummary = TransferDataStore.getTransferSummary();

    if (
      this.state.currentThrottles.upload !== transferSummary.upThrottle ||
      this.state.currentThrottles.download !== transferSummary.downThrottle
    ) {
      this.setState({
        currentThrottles: {
          upload: transferSummary.upThrottle,
          download: transferSummary.downThrottle,
        },
      });
    }
  }

  getDropdownHeader() {
    return (
      <a
        className="sidebar__icon-button sidebar__icon-button--interactive
        sidebar__icon-button--limits"
        title={this.props.intl.formatMessage(MESSAGES.speedLimits)}>
        <LimitsIcon />
        <FormattedMessage {...MESSAGES.speedLimits} />
      </a>
    );
  }

  getDropdownTrigger() {
    let label = this.props.intl.formatMessage(MESSAGES.speedLimits);

    return (
      <Tooltip
        content={label}
        position="bottom"
        ref={node => {
          this.tooltip = node;
        }}
        wrapperClassName="sidebar__icon-button tooltip__wrapper">
        <LimitsIcon />
      </Tooltip>
    );
  }

  getHumanReadableSpeed(bytes) {
    if (bytes === 0) {
      return this.props.intl.formatMessage(MESSAGES.unlimited);
    } else {
      return <Size value={bytes} isSpeed={true} precision={1} />;
    }
  }

  getSpeedList(property) {
    let heading = {
      className: `dropdown__label dropdown__label--${property}`,
      displayName: `${property.charAt(0).toUpperCase()}${property.slice(1)}`,
      selectable: false,
      value: null,
    };

    let insertCurrentThrottle = true;
    let currentThrottle = this.state.currentThrottles;
    let speeds = this.state.speedLimits[property];

    let items = speeds.map(bytes => {
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
        value: bytes,
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
        value: currentThrottle[property],
      });
    }

    items.unshift(heading);

    return items;
  }

  getDropdownMenus() {
    return [this.getSpeedList('download'), this.getSpeedList('upload')];
  }

  handleDropdownOpen() {
    this.tooltip.dismissTooltip();
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
      <Dropdown
        dropdownWrapperClass="dropdown dropdown--speed-limits sidebar__action"
        handleItemSelect={this.handleItemSelect}
        header={this.getDropdownHeader()}
        menuItems={this.getDropdownMenus()}
        onOpen={this.handleDropdownOpen}
        trigger={this.getDropdownTrigger()}
      />
    );
  }
}

export default injectIntl(SpeedLimitDropdown);
