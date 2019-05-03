import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

class NavigationList extends React.Component {
  static propTypes = {
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
    return items.map(item => {
      const classes = classnames(this.props.itemClassName, {
        [this.props.selectedClassName]: item.slug === this.state.selectedItem,
      });

      return (
        <li className={classes} key={item.slug} onClick={this.handleItemClick.bind(this, item)}>
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
