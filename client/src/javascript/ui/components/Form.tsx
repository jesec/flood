import React, {useRef, useEffect, useCallback, useImperativeHandle, forwardRef, FormEvent} from 'react';

import {getDataFromForm, resetFormData} from './util/forms';

interface FormProps {
  children?: React.ReactNode;
  className?: string;
  onChange?: ({
    event,
    formData,
  }: {
    event: Event | FormEvent<HTMLFormElement>;
    formData: Record<string, unknown>;
  }) => void;
  onSubmit?: ({
    event,
    formData,
  }: {
    event: Event | FormEvent<HTMLFormElement>;
    formData: Record<string, unknown>;
  }) => void;
}

export interface FormHandle {
  getFormData: () => Record<string, unknown>;
  resetForm: () => void;
}

const Form = forwardRef<FormHandle, FormProps>(({children, className, onChange, onSubmit}, ref) => {
  const formRef = useRef<HTMLFormElement>(null);

  // Handle custom flood-form-change event
  const handleFormChange = useCallback(
    (event: Event | FormEvent<HTMLFormElement>) => {
      if (formRef.current && onChange) {
        const formData = getDataFromForm(formRef.current);
        onChange({event, formData});
      }
    },
    [onChange],
  );

  // Handle form submit
  const handleFormSubmit = useCallback(
    (event: Event | FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (onSubmit) {
        const formData = getDataFromForm(event.target as HTMLFormElement);
        onSubmit({event, formData});
      }
    },
    [onSubmit],
  );

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      getFormData: () => {
        if (formRef.current) {
          return getDataFromForm(formRef.current);
        }
        return {};
      },
      resetForm: () => {
        if (formRef.current) {
          resetFormData(formRef.current);
        }
      },
    }),
    [],
  );

  // Add/remove custom event listener for flood-form-change
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    // We need to store the handler to remove it later with the same reference
    const customEventHandler = (e: Event) => handleFormChange(e);

    form.addEventListener('flood-form-change', customEventHandler);

    return () => {
      form.removeEventListener('flood-form-change', customEventHandler);
    };
  }, [handleFormChange]);

  return (
    <form
      className={className}
      onChange={handleFormChange}
      onInput={handleFormChange}
      onSubmit={handleFormSubmit}
      ref={formRef}
    >
      {children}
    </form>
  );
});

Form.displayName = 'Form';

export default Form;
