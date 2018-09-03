import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

class NavigationList extends React.Component {
  static propTypes = {
    defaultItem: PropTypes.string,
    itemClassName: PropTypes.string,
    items: PropTypes.array,
    listClassName: PropTypes.string,
    onChange: PropTypes.func,
    selectedClassName: PropTypes.string,
  };

  static defaultProps = {
    itemClassName: 'navigation__item',
    listClassName: 'navigation',
  };

  constructor() {
    super();

    this.state = {
      selectedItem: null,
    };
  }

  getNavigationItems(items) {
    return items.map((item, index) => {
      let classes = classnames(this.props.itemClassName, {
        [this.props.selectedClassName]: item.slug === this.state.selectedItem,
      });

      return (
        <li className={classes} key={index} onClick={this.handleItemClick.bind(this, item)}>
          {item.label}
        </li>
      );
    });
  }

  handleItemClick(item) {
    this.setState({
      selectedItem: item.slug,
    });

    this.props.onChange(item);
  }

  render() {
    return <ul className={this.props.listClassName}>{this.getNavigationItems(this.props.items)}</ul>;
  }
}

export default NavigationList;
