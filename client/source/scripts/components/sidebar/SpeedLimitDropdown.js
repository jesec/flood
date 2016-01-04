import React from 'react';

import ClientActions from '../../actions/ClientActions';
import Dropdown from '../generic/Dropdown';
import Icon from '../icons/Icon';

class Sidebar extends React.Component {
  getDropdownHeader() {
    return (
      <a className="client-stats client-stat--limits">
        <Icon icon="limits" /> Speed Limits
      </a>
    );
  }

  getMenuItems() {
    return [
      [
        {
          displayName: '0.25',
          property: 'upload',
          value: '256'
        },
        {
          displayName: '0.5',
          property: 'upload',
          value: '512'
        },
        {
          displayName: '1',
          property: 'upload',
          value: '1024'
        },
        {
          displayName: '10',
          property: 'upload',
          value: '10240'
        },
        {
          displayName: '100',
          property: 'upload',
          value: '102400'
        },
        {
          displayName: '1000',
          property: 'upload',
          value: '1048576'
        },
        {
          displayName: '5',
          property: 'upload',
          value: '5'
        },
        {
          displayName: '6',
          property: 'upload',
          value: '6'
        },
        {
          displayName: '7',
          property: 'upload',
          value: '7'
        },
        {
          displayName: '8',
          property: 'upload',
          value: '8'
        },
        {
          displayName: '9',
          property: 'upload',
          value: '9'
        },
        {
          displayName: '10',
          property: 'upload',
          value: '10'
        }
      ], [
        {
          displayName: '0.25',
          property: 'download',
          value: '256'
        },
        {
          displayName: '0.5',
          property: 'download',
          value: '512'
        },
        {
          displayName: '1',
          property: 'download',
          value: '1024'
        },
        {
          displayName: '10',
          property: 'download',
          value: '10240'
        },
        {
          displayName: '100',
          property: 'download',
          value: '102400'
        },
        {
          displayName: '1000',
          property: 'download',
          value: '1048576'
        },
        {
          displayName: '5',
          property: 'download',
          value: '5'
        },
        {
          displayName: '6',
          property: 'download',
          value: '6'
        },
        {
          displayName: '7',
          property: 'download',
          value: '7'
        },
        {
          displayName: '8',
          property: 'download',
          value: '8'
        },
        {
          displayName: '9',
          property: 'download',
          value: '9'
        },
        {
          displayName: '10',
          property: 'download',
          value: '10'
        }
      ]
    ];
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
          menuItems={this.getMenuItems()}
          selectedItem={'10000'}
          />
      </div>
    );
  }
}

export default Sidebar;
