import classnames from 'classnames';
import React from 'react';

class NavigationList extends React.Component {
  constructor() {
    super();

    this.state = {
      selectedItem: null
    };
  }

  getNavigationItems(items) {
    return items.map((item, index) => {
      let selectedSlug = null;

      if (this.state.selectedItem) {
        selectedSlug = this.state.selectedItem;
      } else {
        selectedSlug = this.props.defaultItem;
      }

      let classes = classnames(this.props.itemClassName, {
        [this.props.selectedClassName]: item.slug === selectedSlug
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
    let classes = classnames(this.props.listClassName, {
      [this.props.uniqueClassName]: this.props.uniqueClassName
    });

    return (
      <ul className={classes}>
        {this.getNavigationItems(this.props.items)}
      </ul>
    );
  }
}

NavigationList.defaultProps = {
  itemClassName: 'navigation__item',
  listClassName: 'navigation',
  selectedClassName: 'is-active'
};

NavigationList.propTypes = {
  defaultItem: React.PropTypes.string,
  itemClassName: React.PropTypes.string,
  items: React.PropTypes.array,
  listClassName: React.PropTypes.string,
  onChange: React.PropTypes.func,
  selectedClassName: React.PropTypes.string,
  uniqueClassName: React.PropTypes.string
};

export default NavigationList;
