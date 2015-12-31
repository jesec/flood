import React from 'react';

import Dropdown from '../generic/Dropdown';
import Icon from '../icons/Icon';

class Sidebar extends React.Component {
  constructor() {
    super();

    this.state = {
      isEpanded: false
    };
  }

  getDropdownHeader() {
    return (
      <a className="client-stats client-stat--limits">
        <Icon icon="limits" /> Speed Limits
      </a>
    );
  }

  getMenuItems() {
    return [
      {
        displayName: '1',
        property: '1'
      },
      {
        displayName: '2',
        property: '2'
      },
      {
        displayName: '3',
        property: '3'
      },
      {
        displayName: '4',
        property: '4'
      },
      {
        displayName: '5',
        property: '5'
      },
      {
        displayName: '6',
        property: '6'
      },
      {
        displayName: '7',
        property: '7'
      },
      {
        displayName: '8',
        property: '8'
      },
      {
        displayName: '9',
        property: '9'
      },
      {
        displayName: '10',
        property: '10'
      }
    ];
  }

  render() {
    return (
      <div className="client-stats sidebar__item">
        <Dropdown
          handleItemSelect={this.handleItemSelect}
          header={this.getDropdownHeader()}
          menuItems={this.getMenuItems()}
          selectedItem={'1'}
          />
      </div>
    );
  }
}

export default Sidebar;
