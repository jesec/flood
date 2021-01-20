import {Component, ReactNode} from 'react';

import FormRowItem from './FormRowItem';

import type {FormRowItemProps} from './FormRowItem';

export default class FormRowItemGroup extends Component<{
  label?: string;
  width?: FormRowItemProps['width'];
}> {
  getLabel(): ReactNode {
    const {label} = this.props;

    if (label) {
      return <label className="form__element__label">{label}</label>;
    }
    return undefined;
  }

  render() {
    const {children, width} = this.props;

    return (
      <FormRowItem className="form__group" width={width}>
        {this.getLabel()}
        {children}
      </FormRowItem>
    );
  }
}
