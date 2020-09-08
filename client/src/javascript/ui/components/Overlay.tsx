import classnames from 'classnames';
import React, {Component} from 'react';

export interface OverlayProps {
  additionalClassNames?: string;
  isInteractive?: boolean;
  isTransparent?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

class Overlay extends Component<OverlayProps> {
  static defaultProps = {
    isInteractive: true,
  };

  render() {
    const classes = classnames('overlay', this.props.additionalClassNames, {
      'overlay--no-interaction': !this.props.isInteractive,
      'overlay--transparent': this.props.isTransparent,
    });

    return (
      <div className={classes} onClickCapture={this.props.onClick}>
        {this.props.children}
      </div>
    );
  }
}

export default Overlay;
