import {FC} from 'react';
import {Trans} from '@lingui/react';

import {Form, FormRow} from '@client/ui';

import type {FloodSettings} from '@shared/types/FloodSettings';

import ModalFormSectionHeader from '../ModalFormSectionHeader';
import MountPointsList from './lists/MountPointsList';

interface DiskUsageTabProps {
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

const DiskUsageTab: FC<DiskUsageTabProps> = ({onSettingsChange}: DiskUsageTabProps) => (
  <Form>
    <ModalFormSectionHeader>
      <Trans id="settings.diskusage.mount.points" />
    </ModalFormSectionHeader>
    <FormRow>
      <MountPointsList onSettingsChange={onSettingsChange} />
    </FormRow>
  </Form>
);

export default DiskUsageTab;
