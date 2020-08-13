import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {getDataFromForm, resetFormData} from './util/forms';

class Form extends Component {
  formRef = null;

  static propTypes = {
    appendErrors: PropTypes.bool,
    children: PropTypes.node,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    prependErrors: PropTypes.bool,
  };

  componentDidMount() {
    this.formRef.addEventListener('flood-form-change', this.handleFormChange);
  }

  componentWillUnmount() {
    this.formRef.removeEventListener('flood-form-change', this.handleFormChange);
  }

  getFormData = () => {
    return getDataFromForm(this.formRef);
  };

  resetForm = () => {
    resetFormData(this.formRef);
  };

  handleFormChange = (event) => {
    if (this.props.onChange) {
      const formData = getDataFromForm(this.formRef);
      this.props.onChange({event, formData});
    }
  };

  handleFormSubmit = (event) => {
    event.preventDefault();

    if (this.props.onSubmit) {
      const formData = getDataFromForm(event.target);
      this.props.onSubmit({event, formData});
    }
  };

  setFormRef = (ref) => {
    this.formRef = ref;
  };

  render() {
    return (
      <form
        className={this.props.className}
        onChange={this.handleFormChange}
        onInput={this.handleFormChange}
        onSubmit={this.handleFormSubmit}
        ref={this.setFormRef}>
        {this.props.children}
      </form>
    );
  }
}

export default Form;
