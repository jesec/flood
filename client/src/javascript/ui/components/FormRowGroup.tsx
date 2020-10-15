import React from 'react';

interface FormRowGroupProps {
  children: React.ReactNode;
}

const FormRowGroup: React.FC<FormRowGroupProps> = ({children}: FormRowGroupProps) => {
  return <div className="form__row form__row--group">{children}</div>;
};

export default FormRowGroup;
