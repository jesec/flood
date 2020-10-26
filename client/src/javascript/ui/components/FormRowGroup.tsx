import React from 'react';

interface FormRowGroupProps {
  children: React.ReactNode;
}

const FormRowGroup = React.forwardRef<HTMLDivElement, FormRowGroupProps>(({children}: FormRowGroupProps, ref) => {
  return (
    <div className="form__row form__row--group" ref={ref}>
      {children}
    </div>
  );
});

export default FormRowGroup;
