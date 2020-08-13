import classnames from 'classnames';
import React, {Component} from 'react';

class LoadingRing extends Component {
  static defaultProps = {
    size: 'small',
  };

  render() {
    const classes = classnames('icon icon--loading icon--loading--ring', {
      'icon--small': this.props.size === 'small',
    });

    return (
      <div className={classes}>
        <div className="icon__element">
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
              <circle strokeOpacity="0.2" cx="9" cy="9" r="6" />
            </g>
          </svg>
        </div>
        <div className="icon__element icon__ring-slice">
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
              <path d="M9,3 C7.227,3 5.633,3.769 4.535,4.992" />
            </g>
          </svg>
        </div>
      </div>
    );
  }
}

export default LoadingRing;
