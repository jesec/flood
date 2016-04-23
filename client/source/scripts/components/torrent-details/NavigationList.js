import classnames from 'classnames';
import React from 'react';

class NavigationList extends React.Component {
  constructor() {
    constructor();

    this.state = {
      selectedItem: null
    };
  }

  getNavigationItems(items) {
    return items.map((item, index) => {
      let classes = classnames(this.props.itemClassName, {
        [this.props.selectedClassName]: item.slug === this.state.selectedItem
      });

      return (
        <li className={classes} key={index}
          onClick={this.handleItemClick.bind(this, item)}>
          {item.label}
        </li>
      );
    });
  }

  handleItemClick(item) {
    this.setState({
      selectedItem: item.slug
    });

    this.props.onChange(item);
  }

  render() {
    return (
      <ul className={this.props.listClassName}>
        {this.getNavigationItems(this.props.items)}
      </ul>
    );
  }
}

NavigationList.defaultProps = {
  itemClassName: 'navigation__item',
  listClassName: 'navigation'
};

NavigationList.propTypes = {
  defaultItem: React.PropTypes.string,
  itemClassName: React.PropTypes.string,
  items: React.PropTypes.array,
  listClassName: React.PropTypes.string,
  onChange: React.PropTypes.func,
  selectedClassName: React.PropTypes.string
};

export default NavigationList;
