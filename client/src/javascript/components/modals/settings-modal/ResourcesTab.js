import {Checkbox, Form, FormRow, Textbox} from 'flood-ui-kit';
import {FormattedMessage} from 'react-intl';
import React from 'react';

import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsTab from './SettingsTab';

export default class ResourcesTab extends SettingsTab {
  state = {};

  handleFormChange = ({event, formData}) => {
    this.handleClientSettingFieldChange(event.target.name, event);
  };

  render() {
    return (
      <Form onChange={this.handleFormChange}>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.resources.disk.heading" defaultMessage="Disk" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('directoryDefault')}
            id="directoryDefault"
            label={
              <FormattedMessage
                id="settings.resources.disk.download.location.label"
                defaultMessage="Default Download Directory"
              />
            }
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('networkMaxOpenFiles')}
            id="networkMaxOpenFiles"
            label={<FormattedMessage id="settings.resources.max.open.files" defaultMessage="Maximum Open Files" />}
            width="one-half"
          />
          <Checkbox
            checked={this.getFieldValue('piecesHashOnCompletion') === '1'}
            grow={false}
            id="piecesHashOnCompletion"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage
              id="settings.resources.disk.check.hash.label"
              defaultMessage="Verify Hash on Completion"
            />
          </Checkbox>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.resources.memory.heading" defaultMessage="Memory" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('piecesMemoryMax')}
            id="piecesMemoryMax"
            label={
              <div>
                <FormattedMessage id="settings.resources.memory.max.label" defaultMessage="Max Memory Usage" />{' '}
                <em className="unit">(MB)</em>
              </div>
            }
            width="one-half"
          />
        </FormRow>
      </Form>
    );
  }
}
