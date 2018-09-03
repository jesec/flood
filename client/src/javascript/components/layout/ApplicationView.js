import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

class ApplicationView extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    modifier: PropTypes.string,
  };

  render() {
    let classes = classnames('application__view', {
      [`application__view--${this.props.modifier}`]: this.props.modifier != null,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}

export default ApplicationView;
