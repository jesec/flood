import classnames from 'classnames';
import {PureComponent} from 'react';

interface PanelFooterProps {
  hasBorder?: boolean;
}

export default class PanelFooter extends PureComponent<PanelFooterProps> {
  render() {
    const classes = classnames('panel__footer', {
      'panel__footer--has-border': this.props.hasBorder,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}
