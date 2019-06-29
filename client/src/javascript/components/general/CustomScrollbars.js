import classnames from 'classnames';
import React from 'react';
import {Scrollbars} from 'react-custom-scrollbars';

const METHODS_TO_BIND = ['getHorizontalThumb', 'getVerticalThumb'];

export default class CustomScrollbar extends React.Component {
  scrollbarRef = null;

  constructor() {
    super();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getHorizontalThumb(props) {
    if (this.props.getHorizontalThumb) {
      return this.props.getHorizontalThumb(props, this.props.onThumbMouseUp);
    }

    return (
      <div
        {...props}
        className="scrollbars__thumb scrollbars__thumb--horizontal"
        onMouseUp={this.props.onThumbMouseUp}
      />
    );
  }

  getVerticalThumb(props) {
    if (this.props.getVerticalThumb) {
      return this.props.getVerticalThumb(props, this.props.onThumbMouseUp);
    }

    return (
      <div {...props} className="scrollbars__thumb scrollbars__thumb--vertical" onMouseUp={this.props.onThumbMouseUp} />
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
    const {
      children,
      className,
      inverted,
      getHorizontalThumb,
      getVerticalThumb,
      nativeScrollHandler,
      scrollHandler,
      ...otherProps
    } = this.props;
    const classes = classnames('scrollbars', className, {
      'is-inverted': inverted,
    });

    return (
      <Scrollbars
        className={classes}
        ref={ref => {
          this.scrollbarRef = ref;
        }}
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
  scrollHandler: null,
};
