import classnames from 'classnames';
import {PureComponent} from 'react';

interface PanelContentProps {
  hasBorder?: boolean;
  borderPosition?: string;
}

export default class PanelContent extends PureComponent<PanelContentProps> {
  static defaultProps = {
    hasBorder: false,
    borderPosition: 'top',
  };

  render() {
    const classes = classnames(`panel__content`, {
      [`panel__content--has-border--${this.props.borderPosition}`]: this.props.hasBorder,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}
