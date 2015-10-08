import React from 'react';
import ReactDOM from 'react-dom';

import FloodApp from './components/FloodApp';

class FloodAppWrapper extends React.Component {

  constructor() {
    super();
  }

  render() {
    return <FloodApp />
  }

}

ReactDOM.render(<FloodAppWrapper />, document.getElementById('app'));
