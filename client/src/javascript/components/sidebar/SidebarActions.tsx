import React from 'react';

class SidebarActions extends React.Component {
  render() {
    return <div className="sidebar__actions">{this.props.children}</div>;
  }
}

export default SidebarActions;
