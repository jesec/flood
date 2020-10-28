import classnames from 'classnames';
import {PureComponent} from 'react';

interface PanelProps {
  theme?: 'light' | 'dark';
  spacing?: 'small' | 'medium' | 'large';
  transparent?: boolean;
}

class Panel extends PureComponent<PanelProps> {
  static defaultProps = {
    spacing: 'medium',
    theme: 'light',
  };

  render() {
    const classes = classnames(`panel panel--${this.props.theme}`, `panel--${this.props.spacing}`, {
      'panel--transparent': this.props.transparent,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}

export default Panel;
