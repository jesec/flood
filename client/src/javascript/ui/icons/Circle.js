import React, {Component} from 'react';

class Checkmark extends Component {
  render() {
    return (
      <svg
        className="icon icon--checkmark"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="4" />
      </svg>
    );
  }
}

export default Checkmark;
