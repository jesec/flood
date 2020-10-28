import * as React from 'react';

import {getDataFromForm, resetFormData} from './util/forms';

interface FormProps {
  className?: string;
  onChange?: ({
    event,
    formData,
  }: {
    event: Event | React.FormEvent<HTMLFormElement>;
    formData: Record<string, unknown>;
  }) => void;
  onSubmit?: ({
    event,
    formData,
  }: {
    event: Event | React.FormEvent<HTMLFormElement>;
    formData: Record<string, unknown>;
  }) => void;
}

class Form extends React.Component<FormProps> {
  formRef?: HTMLFormElement | null = null;
  componentDidMount() {
    if (this.formRef != null) {
      this.formRef.addEventListener('flood-form-change', this.handleFormChange);
    }
  }

  componentWillUnmount() {
    if (this.formRef != null) {
      this.formRef.removeEventListener('flood-form-change', this.handleFormChange);
    }
  }

  getFormData = (): Record<string, unknown> => {
    if (this.formRef != null) {
      return getDataFromForm(this.formRef);
    }
    return {};
  };

  resetForm = () => {
    if (this.formRef != null) {
      resetFormData(this.formRef);
    }
  };

  handleFormChange = (event: Event | React.FormEvent<HTMLFormElement>) => {
    if (this.formRef != null && this.props.onChange) {
      const formData = getDataFromForm(this.formRef);
      this.props.onChange({event, formData});
    }
  };

  handleFormSubmit = (event: Event | React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (this.props.onSubmit) {
      const formData = getDataFromForm(event.target as HTMLFormElement);
      this.props.onSubmit({event, formData});
    }
  };

  setFormRef = (ref: HTMLFormElement) => {
    this.formRef = ref;
  };

  render() {
    const {children, className} = this.props;

    return (
      <form
        className={className}
        onChange={this.handleFormChange}
        onInput={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={this.setFormRef}>
        {children}
      </form>
    );
  }
}

export default Form;
