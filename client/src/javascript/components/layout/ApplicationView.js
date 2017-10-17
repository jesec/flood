import classnames from 'classnames';
import React from 'react';

class ApplicationView extends React.Component {
  render() {
    let classes = classnames('application__view', {
      [`application__view--${this.props.modifier}`]: this.props.modifier != null
    });

    return (
      <div className={classes}>
        {this.props.children}
      </div>
    );
  }
}

ApplicationView.propTypes = {
  children: React.PropTypes.node,
  modifier: React.PropTypes.string
};

export default ApplicationView;
