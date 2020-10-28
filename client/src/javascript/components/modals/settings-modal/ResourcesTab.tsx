import {FormattedMessage} from 'react-intl';

import {Checkbox, Form, FormRow, Textbox} from '../../../ui';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsTab from './SettingsTab';

export default class ResourcesTab extends SettingsTab {
  render() {
    return (
      <Form onChange={({event}) => this.handleClientSettingChange(event)}>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.resources.disk.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('directoryDefault')}
            id="directoryDefault"
            label={<FormattedMessage id="settings.resources.disk.download.location.label" />}
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('networkMaxOpenFiles')}
            id="networkMaxOpenFiles"
            label={<FormattedMessage id="settings.resources.max.open.files" />}
            width="one-half"
          />
          <Checkbox
            checked={this.getChangedClientSetting('piecesHashOnCompletion')}
            grow={false}
            id="piecesHashOnCompletion"
            labelOffset
            matchTextboxHeight>
            <FormattedMessage id="settings.resources.disk.check.hash.label" />
          </Checkbox>
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.resources.memory.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('piecesMemoryMax')}
            id="piecesMemoryMax"
            label={
              <div>
                <FormattedMessage id="settings.resources.memory.max.label" /> <em className="unit">(MB)</em>
              </div>
            }
            width="one-half"
          />
        </FormRow>
      </Form>
    );
  }
}
