import {FormattedMessage} from 'react-intl';
import _ from 'lodash';
import React from 'react';

import Checkbox from '../../General/FormElements/Checkbox';
import SettingsTab from './SettingsTab';

export default class ResourcesTab extends SettingsTab {
  constructor() {
    super(...arguments);

    this.state = {};
  }

  render() {
    return (
      <div className="form">
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage
              id="settings.resources.disk.heading"
              defaultMessage="Disk"
            />
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.resources.disk.download.location.label"
                  defaultMessage="Default Download Directory"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'directoryDefault')}
                value={this.getFieldValue('directoryDefault')} />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column form__column--half">
              <label className="form__label">
                Maximum Open Files
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'networkMaxOpenFiles')}
                value={this.getFieldValue('networkMaxOpenFiles')} />
            </div>
            <div className="form__column form__column--auto
              form__column--unlabled">
              <Checkbox
                checked={this.getFieldValue('piecesHashOnCompletion') === '1'}
                onChange={this.handleClientSettingCheckboxChange.bind(this, 'piecesHashOnCompletion')}>
                <FormattedMessage
                  id="settings.resources.disk.check.hash.label"
                  defaultMessage="Verify Hash on Completion"
                />
              </Checkbox>
            </div>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage
              id="settings.resources.memory.heading"
              defaultMessage="Memory"
            />
          </div>
          <div className="form__row">
            <div className="form__column form__column--half">
              <label className="form__label">
                <FormattedMessage
                  id="settings.resources.memory.max.label"
                  defaultMessage="Max Memory Usage"
                /> <em className="unit">(MB)</em>
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'piecesMemoryMax')}
                value={this.getFieldValue('piecesMemoryMax')} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
