import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Circle from '../icons/Circle';
import ToggleInput from './ToggleInput';

class Radio extends Component {
  static propTypes = {
    groupID: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  render() {
    return <ToggleInput {...this.props} icon={<Circle />} id={this.props.groupID} type="radio" value={this.props.id} />;
  }
}

export default Radio;
