import classnames from 'classnames';
import {Component} from 'react';
import {injectIntl, WrappedComponentProps} from 'react-intl';

import Badge from '../general/Badge';

interface SidebarFilterProps extends WrappedComponentProps {
  name: string;
  icon?: JSX.Element;
  isActive: boolean;
  slug: string;
  count: number;
  handleClick: (slug: string) => void;
}

class SidebarFilter extends Component<SidebarFilterProps> {
  constructor(props: SidebarFilterProps) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.handleClick(this.props.slug);
  }

  render() {
    const classNames = classnames('sidebar-filter__item', {
      'is-active': this.props.isActive,
    });
    let {name} = this.props;

    if (this.props.name === '') {
      name = this.props.intl.formatMessage({
        id: 'filter.all',
      });
    } else if (this.props.name === 'untagged') {
      if (this.props.count === 0) {
        return null;
      }
      name = this.props.intl.formatMessage({
        id: 'filter.untagged',
      });
    }

    if (this.props.slug === 'checking' || this.props.slug === 'error') {
      if (this.props.count === 0) {
        return null;
      }
    }

    return (
      <li className={classNames} onClick={this.handleClick}>
        {this.props.icon}
        {name}
        <Badge>{this.props.count}</Badge>
      </li>
    );
  }
}

export default injectIntl(SidebarFilter);
