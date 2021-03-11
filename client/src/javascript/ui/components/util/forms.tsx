export const dispatchEvent = (
  eventID: string,
  element: HTMLInputElement,
  options = {bubbles: true, cancelable: true},
): void => {
  let event;

  if (typeof Event === 'function') {
    event = new Event(eventID, options);
  } else {
    event = document.createEvent('Event');
    event.initEvent(eventID, options.bubbles, options.cancelable);
  }

  element.dispatchEvent(event);
};

export const dispatchChangeEvent = (element: HTMLInputElement): void => {
  dispatchEvent('flood-form-change', element);
};

export const getDataFromForm = (form: HTMLFormElement): Record<string, unknown> =>
  Array.from(form.elements).reduce((formData: Record<string, unknown>, element) => {
    const inputElement = element as HTMLInputElement;
    const {name, type, value} = inputElement;
    const retForm = formData;

    if (!name || type === 'button' || type === 'submit' || type === 'reset') {
      return retForm;
    }

    if (type === 'checkbox') {
      retForm[name] = inputElement.checked;
    } else if (type !== 'radio') {
      retForm[name] = value;
    } else if (type === 'radio' && !inputElement.checked && formData[name] === undefined) {
      retForm[name] = null;
    } else if (type === 'radio' && inputElement.checked) {
      retForm[name] = value;
    }

    return retForm;
  }, {});

export const resetFormData = (form: HTMLFormElement): void =>
  Array.from(form.elements).forEach((element) => {
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
