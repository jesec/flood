import classnames from 'classnames';
import {PureComponent} from 'react';

interface PanelHeaderProps {
  hasBorder?: boolean;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export default class PanelHeader extends PureComponent<PanelHeaderProps> {
  static defaultProps = {
    hasBorder: false,
    level: 1,
  };

  render() {
    const classes = classnames(`panel__header panel__header--level-${this.props.level}`, {
      'panel__header--has-border': this.props.hasBorder,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}
