import _ from 'lodash';
import React from 'react';

import Checkbox from '../forms/Checkbox';
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
            Disk
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                Default Download Directory
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'directoryDefault')}
                value={this.getFieldValue('directoryDefault')} />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column form__column--auto">
              <Checkbox
                checked={this.getFieldValue('piecesHashOnCompletion') === '1'}
                onChange={this.handleClientSettingCheckboxChange.bind(this, 'piecesHashOnCompletion')}>
                Verify Hash on Completion
              </Checkbox>
            </div>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            Memory
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                Max Memory Usage <em className="unit">(MB)</em>
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
