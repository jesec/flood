import {forwardRef, ReactNode} from 'react';

interface FormRowGroupProps {
  children: ReactNode;
}

const FormRowGroup = forwardRef<HTMLDivElement, FormRowGroupProps>(({children}: FormRowGroupProps, ref) => (
  <div className="form__row form__row--group" ref={ref}>
    {children}
  </div>
));

export default FormRowGroup;
