import React, {Component} from 'react';

import FormRowItem from './FormRowItem';

import type {FormRowItemProps} from './FormRowItem';

export default class FormRowItemGroup extends Component<{label?: string; width?: FormRowItemProps['width']}> {
  getLabel(): React.ReactNode {
    if (this.props.label) {
      return <label className="form__element__label">{this.props.label}</label>;
    }
    return undefined;
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
