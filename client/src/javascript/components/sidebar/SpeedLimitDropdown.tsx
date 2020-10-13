import {defineMessages, FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';
import sortedIndex from 'lodash/sortedIndex';

import type {TransferDirection} from '@shared/types/TransferData';

import connectStores from '../../util/connectStores';
import Dropdown from '../general/form-elements/Dropdown';
import LimitsIcon from '../icons/Limits';
import SettingsStore from '../../stores/SettingsStore';
import Size from '../general/Size';
import Tooltip from '../general/Tooltip';
import TransferDataStore from '../../stores/TransferDataStore';

import type {DropdownItem} from '../general/form-elements/Dropdown';

interface SpeedLimitDropdownProps extends WrappedComponentProps {
  currentThrottles?: Record<TransferDirection, number>;
  speedLimits?: Record<TransferDirection, Array<number>>;
}

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

class SpeedLimitDropdown extends React.Component<SpeedLimitDropdownProps> {
  static handleItemSelect(item: DropdownItem<TransferDirection>) {
    if (item.value != null) {
      if (item.property === 'download') {
        SettingsStore.setClientSetting('throttleGlobalDownMax', item.value);
      } else if (item.property === 'upload') {
        SettingsStore.setClientSetting('throttleGlobalUpMax', item.value);
      }
    }
  }

  tooltipRef: Tooltip | null = null;

  getDropdownHeader(): React.ReactNode {
    return (
      <button
        className="sidebar__icon-button sidebar__icon-button--interactive
        sidebar__icon-button--limits"
        title={this.props.intl.formatMessage(MESSAGES.speedLimits)}>
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
    const heading = {
      className: `dropdown__label dropdown__label--${direction}`,
      ...(direction === 'download'
        ? {displayName: this.props.intl.formatMessage(MESSAGES.download)}
        : {displayName: this.props.intl.formatMessage(MESSAGES.upload)}),
      selectable: false,
      value: null,
    };

    let insertCurrentThrottle = true;
    const currentThrottle: Record<TransferDirection, number> = this.props.currentThrottles || {download: 0, upload: 0};
    const speeds: number[] = (this.props.speedLimits != null && this.props.speedLimits[direction]) || [0];

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

const ConnectedSpeedLimitDropdown = connectStores(injectIntl(SpeedLimitDropdown), () => {
  return [
    {
      store: SettingsStore,
      event: 'SETTINGS_CHANGE',
      getValue: ({store}) => {
        const storeSettings = store as typeof SettingsStore;
        return {
          speedLimits: storeSettings.getFloodSetting('speedLimits'),
        };
      },
    },
    {
      store: TransferDataStore,
      event: 'CLIENT_TRANSFER_SUMMARY_CHANGE',
      getValue: ({store}) => {
        const storeTransferData = store as typeof TransferDataStore;
        const transferSummary = storeTransferData.getTransferSummary();

        return {
          currentThrottles: {
            upload: transferSummary.upThrottle,
            download: transferSummary.downThrottle,
          },
        };
      },
    },
  ];
});

export default ConnectedSpeedLimitDropdown;
