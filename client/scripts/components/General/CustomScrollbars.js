import classnames from 'classnames';
import React from 'react';
import {Scrollbars} from 'react-custom-scrollbars';

const METHODS_TO_BIND = ['getHorizontalThumb', 'getVerticalThumb'];

export default class CustomScrollbar extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getHorizontalThumb(props) {
    return (
      <div {...props}
        className="scrollbars__thumb scrollbars__thumb--horizontal"
        onMouseUp={this.props.onThumbMouseUp} />
    );
  }

  getVerticalThumb(props) {
    return (
      <div {...props}
        className="scrollbars__thumb scrollbars__thumb--vertical"
        onMouseUp={this.props.onThumbMouseUp} />
    );
  }

  renderView(props) {
    return (
      <div {...props} className="scrollbars__view">
        {props.children}
      </div>
    );
  }

  render() {
    let {children, className, inverted, nativeScrollHandler, scrollHandler,
      ...otherProps} = this.props;
    let classes = classnames('scrollbars', className, {
      'is-inverted': inverted
    });

    return (
      <Scrollbars
        className={classes}
        ref="scrollbar"
        renderView={this.renderView}
        renderThumbHorizontal={this.getHorizontalThumb}
        renderThumbVertical={this.getVerticalThumb}
        onScroll={nativeScrollHandler}
        onScrollFrame={scrollHandler}
        {...otherProps}>
        {children}
      </Scrollbars>
    );
  }
}

CustomScrollbar.defaultProps = {
  className: '',
  inverted: false,
  nativeScrollHandler: null,
  scrollHandler: null
};
