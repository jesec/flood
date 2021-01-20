import {FC, useRef} from 'react';
import {FormattedMessage, IntlShape, useIntl} from 'react-intl';
import {observer} from 'mobx-react';
import sortedIndex from 'lodash/sortedIndex';

import ClientActions from '@client/actions/ClientActions';
import {Limits} from '@client/ui/icons';
import SettingStore from '@client/stores/SettingStore';

import type {TransferDirection} from '@shared/types/TransferData';

import Dropdown from '../general/form-elements/Dropdown';
import Size from '../general/Size';
import Tooltip from '../general/Tooltip';

import type {DropdownItem} from '../general/form-elements/Dropdown';

const HumanReadableSpeed: FC<{bytes: number}> = ({bytes}: {bytes: number}) =>
  bytes === 0 ? <FormattedMessage id="speed.unlimited" /> : <Size value={bytes} isSpeed precision={1} />;

const getSpeedList = ({
  intl,
  direction,
  speedLimits,
  throttleGlobalDownSpeed,
  throttleGlobalUpSpeed,
}: {
  intl: IntlShape;
  direction: TransferDirection;
  speedLimits: {
    download: Array<number>;
    upload: Array<number>;
  };
  throttleGlobalDownSpeed: number;
  throttleGlobalUpSpeed: number;
}): Array<DropdownItem<TransferDirection>> => {
  const heading = {
    className: `dropdown__label dropdown__label--${direction}`,
    ...(direction === 'download'
      ? {displayName: intl.formatMessage({id: 'sidebar.speedlimits.download'})}
      : {displayName: intl.formatMessage({id: 'sidebar.speedlimits.upload'})}),
    selectable: false,
    value: null,
  };

  const currentThrottle: Record<TransferDirection, number> = {
    download: throttleGlobalDownSpeed,
    upload: throttleGlobalUpSpeed,
  };

  const speeds: number[] = speedLimits[direction];

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
      displayName: <HumanReadableSpeed bytes={bytes} />,
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
      displayName: <HumanReadableSpeed bytes={currentThrottle[direction]} />,
      property: direction,
      selected: true,
      selectable: true,
      value: currentThrottle[direction],
    });
  }

  items.unshift(heading);

  return items;
};

const SpeedLimitDropdown: FC = observer(() => {
  const intl = useIntl();
  const tooltipRef = useRef<Tooltip>(null);

  const label = intl.formatMessage({id: 'sidebar.button.speedlimits'});
  const speedListOptions = {
    intl,
    speedLimits: SettingStore.floodSettings.speedLimits,
    throttleGlobalDownSpeed: SettingStore.clientSettings?.throttleGlobalDownSpeed ?? 0,
    throttleGlobalUpSpeed: SettingStore.clientSettings?.throttleGlobalUpSpeed ?? 0,
  };

  return (
    <Dropdown
      dropdownWrapperClass="dropdown dropdown--speed-limits sidebar__action"
      handleItemSelect={(item) => {
        if (item.value != null) {
          if (item.property === 'download') {
            ClientActions.saveSetting('throttleGlobalDownSpeed', item.value);
          } else if (item.property === 'upload') {
            ClientActions.saveSetting('throttleGlobalUpSpeed', item.value);
          }
        }
      }}
      header={
        <button
          className="sidebar__icon-button sidebar__icon-button--interactive
        sidebar__icon-button--limits"
          title={label}
          type="button">
          <Limits />
          {label}
        </button>
      }
      menuItems={[
        getSpeedList({direction: 'download', ...speedListOptions}),
        getSpeedList({direction: 'upload', ...speedListOptions}),
      ]}
      onOpen={() => {
        if (tooltipRef.current != null) {
          tooltipRef.current.dismissTooltip();
        }
      }}
      trigger={
        <Tooltip
          content={label}
          position="bottom"
          ref={tooltipRef}
          wrapperClassName="sidebar__icon-button tooltip__wrapper">
          <Limits />
        </Tooltip>
      }
    />
  );
});

export default SpeedLimitDropdown;
