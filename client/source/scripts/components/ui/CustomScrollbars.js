import classnames from 'classnames';
import React from 'react';
import {Scrollbars} from 'react-custom-scrollbars';

export default class CustomScrollbar extends React.Component {
  getHorizontalThumb(props) {
    return (
      <div {...props}
        className="scrollbars__thumb scrollbars__thumb--horizontal"/>
    );
  }

  getVerticalThumb(props) {
    return (
      <div {...props}
        className="scrollbars__thumb scrollbars__thumb--vertical"/>
    );
  }

  render() {
    let classes = classnames('scrollbars', {
      [this.props.className]: this.props.className,
      'is-inverted': this.props.inverted
    });

    return (
      <Scrollbars
        className={classes}
        ref="scrollbar"
        renderThumbHorizontal={this.getHorizontalThumb}
        renderThumbVertical={this.getVerticalThumb}
        onScroll={this.props.scrollHandler}>
        {this.props.children}
      </Scrollbars>
    );
  }
}

CustomScrollbar.defaultProps = {
  className: '',
  inverted: false,
  scrollHandler: null
};
