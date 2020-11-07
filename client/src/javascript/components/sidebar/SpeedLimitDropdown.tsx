import {defineMessages, FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {observer} from 'mobx-react';
import sortedIndex from 'lodash/sortedIndex';
import * as React from 'react';

import type {TransferDirection} from '@shared/types/TransferData';

import ClientActions from '../../actions/ClientActions';
import Dropdown from '../general/form-elements/Dropdown';
import LimitsIcon from '../icons/Limits';
import SettingStore from '../../stores/SettingStore';
import Size from '../general/Size';
import Tooltip from '../general/Tooltip';

import type {DropdownItem} from '../general/form-elements/Dropdown';

const MESSAGES = defineMessages({
  speedLimits: {
    id: 'sidebar.button.speedlimits',
  },
  download: {
    id: 'sidebar.speedlimits.download',
  },
  upload: {
    id: 'sidebar.speedlimits.upload',
  },
  unlimited: {
    id: 'speed.unlimited',
  },
});

@observer
class SpeedLimitDropdown extends React.Component<WrappedComponentProps> {
  static handleItemSelect(item: DropdownItem<TransferDirection>) {
    const bytes = item.value;
    if (bytes != null) {
      const kb = Math.trunc(bytes / 1024);
      if (item.property === 'download') {
        ClientActions.saveSetting('throttleGlobalDownMax', kb);
      } else if (item.property === 'upload') {
        ClientActions.saveSetting('throttleGlobalUpMax', kb);
      }
    }
  }

  tooltipRef: Tooltip | null = null;

  getDropdownHeader(): React.ReactNode {
    return (
      <button
        className="sidebar__icon-button sidebar__icon-button--interactive
        sidebar__icon-button--limits"
        title={this.props.intl.formatMessage(MESSAGES.speedLimits)}
        type="button">
        <LimitsIcon />
        <FormattedMessage {...MESSAGES.speedLimits} />
      </button>
    );
  }

  getDropdownTrigger(): React.ReactNode {
    const label = this.props.intl.formatMessage(MESSAGES.speedLimits);

    return (
      <Tooltip
        content={label}
        position="bottom"
        ref={(node) => {
          this.tooltipRef = node;
        }}
        wrapperClassName="sidebar__icon-button tooltip__wrapper">
        <LimitsIcon />
      </Tooltip>
    );
  }

  getHumanReadableSpeed(bytes: number): React.ReactNode {
    if (bytes === 0) {
      return this.props.intl.formatMessage(MESSAGES.unlimited);
    }
    return <Size value={bytes} isSpeed precision={1} />;
  }

  getSpeedList(direction: TransferDirection): Array<DropdownItem<TransferDirection>> {
    const {speedLimits} = SettingStore.floodSettings;
    const {throttleGlobalDownMax = 0, throttleGlobalUpMax = 0} = SettingStore.clientSettings || {};

    const heading = {
      className: `dropdown__label dropdown__label--${direction}`,
      ...(direction === 'download'
        ? {displayName: this.props.intl.formatMessage(MESSAGES.download)}
        : {displayName: this.props.intl.formatMessage(MESSAGES.upload)}),
      selectable: false,
      value: null,
    };

    const currentThrottle: Record<TransferDirection, number> = {
      // Kb/s to B/s
      download: throttleGlobalDownMax * 1024,
      upload: throttleGlobalUpMax * 1024,
    };

    const speeds: number[] = speedLimits[direction].map((kb) => kb * 1024);

    let insertCurrentThrottle = true;
    const items: Array<DropdownItem<TransferDirection>> = speeds.map((bytes) => {
      let selected = false;

      // Check if the current throttle setting exists in the preset speeds list.
      // Determine if we need to add the current throttle setting to the menu.
      if (currentThrottle && currentThrottle[direction] === bytes) {
        selected = true;
        insertCurrentThrottle = false;
      }

      return {
        displayName: this.getHumanReadableSpeed(bytes),
        property: direction,
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
      const insertionPoint = sortedIndex(speeds, currentThrottle[direction]);

      items.splice(insertionPoint, 0, {
        displayName: this.getHumanReadableSpeed(currentThrottle[direction]),
        property: direction,
        selected: true,
        selectable: true,
        value: currentThrottle[direction],
      });
    }

    items.unshift(heading);

    return items;
  }

  getDropdownMenus() {
    return [this.getSpeedList('download'), this.getSpeedList('upload')];
  }

  handleDropdownOpen = () => {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }
  };

  render() {
    return (
      <Dropdown
        dropdownWrapperClass="dropdown dropdown--speed-limits sidebar__action"
        handleItemSelect={SpeedLimitDropdown.handleItemSelect}
        header={this.getDropdownHeader()}
        menuItems={this.getDropdownMenus()}
        onOpen={this.handleDropdownOpen}
        trigger={this.getDropdownTrigger()}
      />
    );
  }
}

export default injectIntl(SpeedLimitDropdown);
