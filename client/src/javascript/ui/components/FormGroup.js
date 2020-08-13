import React, {Component} from 'react';

import FormRowItem from './FormRowItem';

export default class FormRowItemGroup extends Component {
  getLabel() {
    if (this.props.label) {
      return <label className="form__element__label">{this.props.label}</label>;
    }
  }

  render() {
    return (
      <FormRowItem className="form__group" width={this.props.width}>
        {this.getLabel()}
        {this.props.children}
      </FormRowItem>
    );
  }
}
