import {FormElementAddon, FormRow, FormRowGroup, Textbox} from 'flood-ui-kit';
import React from 'react';

import AddMini from '../../icons/AddMini';
import RemoveMini from '../../icons/RemoveMini';

export default class TextboxRepeater extends React.PureComponent {
  state = {
    textboxes: [{id: 0, value: ''}],
  };

  _idCounter = 0;

  getID() {
    return ++this._idCounter;
  }

  getTextboxes = () => {
    return this.state.textboxes.map((textbox, index) => {
      let removeButton = null;

      if (index > 0) {
        removeButton = (
          <FormElementAddon onClick={this.handleTextboxRemove.bind(textbox, index)}>
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
            <FormElementAddon onClick={this.handleTextboxAdd.bind(textbox, index)}>
              <AddMini size="mini" />
            </FormElementAddon>
            {removeButton}
          </Textbox>
        </FormRow>
      );
    });
  };

  handleTextboxAdd = index => {
    const textboxes = Object.assign([], this.state.textboxes);
    textboxes.splice(index + 1, 0, {id: this.getID(), value: ''});
    this.setState({textboxes});
  };

  handleTextboxRemove = index => {
    const textboxes = Object.assign([], this.state.textboxes);
    textboxes.splice(index, 1);
    this.setState({textboxes});
  };

  render() {
    return <FormRowGroup>{this.getTextboxes()}</FormRowGroup>;
  }
}
