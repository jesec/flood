export const dispatchEvent = (
  eventID: string,
  element: HTMLInputElement,
  options = {bubbles: true, cancelable: true},
) => {
  let event;

  if (typeof Event === 'function') {
    event = new Event(eventID, options);
  } else {
    event = document.createEvent('Event');
    event.initEvent(eventID, options.bubbles, options.cancelable);
  }

  element.dispatchEvent(event);
};

export const dispatchChangeEvent = (element: HTMLInputElement) => {
  dispatchEvent('flood-form-change', element);
};

export const getDataFromForm = (form: HTMLFormElement) => {
  return Array.from(form.elements).reduce((formData: Record<string, unknown>, element) => {
    const inputElement = element as HTMLInputElement;
    const {name, type, value} = inputElement;

    if (!name || type === 'button' || type === 'submit' || type === 'reset') {
      return formData;
    }

    if (type === 'checkbox') {
      formData[name] = inputElement.checked;
    } else if (type !== 'radio') {
      formData[name] = value;
    } else if (type === 'radio' && !inputElement.checked && formData[name] === undefined) {
      formData[name] = null;
    } else if (type === 'radio' && inputElement.checked) {
      formData[name] = value;
    }

    return formData;
  }, {});
};

export const resetFormData = (form: HTMLFormElement) => {
  return Array.from(form.elements).forEach((element) => {
    const inputElement = element as HTMLInputElement;
    // getAttribute is supposedly faster than using the dataset API.
    const defaultValue = inputElement.getAttribute('data-initial-value');

    if (inputElement.type === 'checkbox' || inputElement.type === 'radio') {
      if (defaultValue === 'true') {
        inputElement.checked = true;
      } else {
        inputElement.checked = false;
      }
    } else if (defaultValue !== null) {
      inputElement.value = defaultValue;
    } else {
      inputElement.value = '';
    }
  });
};
