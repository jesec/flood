import React, {Component} from 'react';

class Chevron extends Component {
  render() {
    return (
      <svg className="icon icon--chevron" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5.193 6.631A1 1 0 0 0 3.733 8l5.199 5.549 5.376-5.536a1 1 0 0 0-1.435-1.394L8.958
            10.65 5.193 6.631z"
          fillRule="nonzero"
        />
      </svg>
    );
  }
}

export default Chevron;
