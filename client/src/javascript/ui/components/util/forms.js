export const dispatchEvent = (eventID, element, options = {bubbles: true, cancelable: true}) => {
  let event;

  if (typeof Event === 'function') {
    event = new Event(eventID, options);
  } else {
    event = document.createEvent('Event');
    event.initEvent(eventID, options.bubbles, options.cancelable);
  }

  element.dispatchEvent(event);
};

export const dispatchChangeEvent = (element) => {
  dispatchEvent('flood-form-change', element);
};

export const getDataFromForm = (form) => {
  return Array.from(form.elements).reduce((formData, element) => {
    const {name, type, value} = element;

    if (!name || type === 'button' || type === 'submit' || type === 'reset') {
      return formData;
    }

    if (type === 'checkbox') {
      formData[name] = element.checked;
    } else if (type !== 'radio') {
      formData[name] = value;
    } else if (type === 'radio' && !element.checked && formData[name] === undefined) {
      formData[name] = null;
    } else if (type === 'radio' && element.checked) {
      formData[name] = value;
    }

    return formData;
  }, {});
};

export const resetFormData = (form) => {
  return Array.from(form.elements).forEach((element) => {
    // getAttribute is supposedly faster than using the dataset API.
    const defaultValue = element.getAttribute('data-initial-value');

    if (element.type === 'checkbox' || element.type === 'radio') {
      if (defaultValue === 'true') {
        element.checked = true;
      } else {
        element.checked = false;
      }
    } else if (defaultValue !== null) {
      element.value = defaultValue;
    } else {
      element.value = '';
    }
  });
};
