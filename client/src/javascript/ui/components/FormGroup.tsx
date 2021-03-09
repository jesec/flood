import {FC, ReactNode} from 'react';

import FormRowItem from './FormRowItem';

import type {FormRowItemProps} from './FormRowItem';

interface FormGroupProps {
  children: ReactNode;
  label?: string;
  width?: FormRowItemProps['width'];
}

const FormGroup: FC<FormGroupProps> = ({children, label, width}: FormGroupProps) => (
  <FormRowItem className="form__group" width={width}>
    {label ? <span className="form__element__label">{label}</span> : undefined}
    {children}
  </FormRowItem>
);

FormGroup.defaultProps = {
  label: undefined,
  width: 'auto',
};

export default FormGroup;
