import React from 'react';

import {FormElementAddon, FormRow, FormRowGroup, Textbox} from '../../../ui';
import AddMini from '../../icons/AddMini';
import RemoveMini from '../../icons/RemoveMini';

export const getTextArray = (formData: Record<string, string | undefined>, id: string) => {
  return Object.keys(formData).reduce((accumulator: Array<string>, formItemKey: string) => {
    if (formItemKey.startsWith(id)) {
      const text = formData[formItemKey];
      if (text != null) {
        accumulator.push(text);
      }
    }
    return accumulator;
  }, []);
};

interface TextboxRepeaterProps {
  defaultValues?: Array<{id: number; value: string}>;
  id: number | string;
  label?: string;
  placeholder?: string;
}

interface TextboxRepeaterStates {
  textboxes: Array<{id: number; value: string}>;
}

export default class TextboxRepeater extends React.PureComponent<TextboxRepeaterProps, TextboxRepeaterStates> {
  idCounter = 0;

  constructor(props: TextboxRepeaterProps) {
    super(props);
    this.state = {
      textboxes: this.props.defaultValues || [{id: 0, value: ''}],
    };
  }

  getID() {
    this.idCounter += 1;
    return this.idCounter;
  }

  getTextboxes = () =>
    this.state.textboxes.map((textbox, index) => {
      let removeButton = null;

      if (index > 0) {
        removeButton = (
          <FormElementAddon
            onClick={() => {
              this.handleTextboxRemove(index);
            }}>
            <RemoveMini size="mini" />
          </FormElementAddon>
        );
      }

      return (
        <FormRow key={textbox.id}>
          <Textbox
            addonPlacement="after"
            id={`${this.props.id}-${textbox.id}`}
            defaultValue={textbox.value}
            label={index === 0 && this.props.label}
            placeholder={this.props.placeholder}
            wrapperClassName="textbox-repeater">
            <FormElementAddon
              onClick={() => {
                this.handleTextboxAdd(index);
              }}>
              <AddMini size="mini" />
            </FormElementAddon>
            {removeButton}
          </Textbox>
        </FormRow>
      );
    });

  handleTextboxAdd = (index: number) => {
    this.setState((state) => {
      const textboxes = Object.assign([], state.textboxes);
      textboxes.splice(index + 1, 0, {id: this.getID(), value: ''});
      return {textboxes};
    });
  };

  handleTextboxRemove = (index: number) => {
    this.setState((state) => {
      const textboxes = Object.assign([], state.textboxes);
      textboxes.splice(index, 1);
      return {textboxes};
    });
  };

  render() {
    return <FormRowGroup>{this.getTextboxes()}</FormRowGroup>;
  }
}
