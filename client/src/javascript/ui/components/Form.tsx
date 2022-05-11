import {Component, FormEvent, ReactNode} from 'react';

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

class Form extends Component<FormProps> {
  formRef?: HTMLFormElement | null = null;
  componentDidMount(): void {
    if (this.formRef != null) {
      this.formRef.addEventListener('flood-form-change', this.handleFormChange);
    }
  }

  componentWillUnmount(): void {
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

  resetForm = (): void => {
    if (this.formRef != null) {
      resetFormData(this.formRef);
    }
  };

  handleFormChange = (event: Event | FormEvent<HTMLFormElement>): void => {
    const {onChange} = this.props;
    if (this.formRef != null && onChange) {
      const formData = getDataFromForm(this.formRef);
      onChange({event, formData});
    }
  };

  handleFormSubmit = (event: Event | FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const {onSubmit} = this.props;
    if (onSubmit) {
      const formData = getDataFromForm(event.target as HTMLFormElement);
      onSubmit({event, formData});
    }
  };

  setFormRef = (ref: HTMLFormElement): void => {
    this.formRef = ref;
  };

  render(): ReactNode {
    const {children, className} = this.props;

    return (
      <form
        className={className}
        onChange={this.handleFormChange}
        onInput={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={this.setFormRef}
      >
        {children}
      </form>
    );
  }
}

export default Form;
