import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import {Form, FormRow} from '../../../ui';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsTab from './SettingsTab';
import MountPointsList from './lists/MountPointsList';

class DiskUsageTab extends SettingsTab {
  render() {
    return (
      <Form>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.diskusage.mount.points" />
        </ModalFormSectionHeader>
        <FormRow>
          <MountPointsList onSettingsChange={this.props.onSettingsChange} />
        </FormRow>
      </Form>
    );
  }
}

export default injectIntl(DiskUsageTab);
