import {FC, ReactNode} from 'react';

import FormRowItem from './FormRowItem';

import type {FormRowItemProps} from './FormRowItem';

interface FormRowItemGroupProps {
  children: ReactNode;
  label?: string;
  width?: FormRowItemProps['width'];
}

const FormRowItemGroup: FC<FormRowItemGroupProps> = ({children, label, width}: FormRowItemGroupProps) => (
  <FormRowItem className="form__group" width={width}>
    {label ? <label className="form__element__label">{label}</label> : undefined}
    {children}
  </FormRowItem>
);

FormRowItemGroup.defaultProps = {
  label: undefined,
  width: 'auto',
};

export default FormRowItemGroup;
