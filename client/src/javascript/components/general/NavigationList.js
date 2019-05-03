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
    uniqueClassName: PropTypes.string,
  };

  static defaultProps = {
    itemClassName: 'navigation__item',
    listClassName: 'navigation',
    selectedClassName: 'is-active',
  };

  constructor() {
    super();

    this.state = {
      selectedItem: null,
    };
  }

  getNavigationItems(items) {
    return items.map(item => {
      let selectedSlug = null;

      if (this.state.selectedItem) {
        selectedSlug = this.state.selectedItem;
      } else {
        selectedSlug = this.props.defaultItem;
      }

      const classes = classnames(this.props.itemClassName, {
        [this.props.selectedClassName]: item.slug === selectedSlug,
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
    const classes = classnames(this.props.listClassName, {
      [this.props.uniqueClassName]: this.props.uniqueClassName,
    });

    return <ul className={classes}>{this.getNavigationItems(this.props.items)}</ul>;
  }
}

export default NavigationList;
