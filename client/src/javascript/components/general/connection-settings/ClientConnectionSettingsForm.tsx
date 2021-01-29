import {FC, ReactNode, useEffect, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {FormRow, Select, SelectItem} from '@client/ui';

import {SUPPORTED_CLIENTS} from '@shared/schema/constants/ClientConnectionSettings';

import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import QBittorrentConnectionSettingsForm from './QBittorrentConnectionSettingsForm';
import RTorrentConnectionSettingsForm from './RTorrentConnectionSettingsForm';
import TransmissionConnectionSettingsForm from './TransmissionConnectionSettingsForm';

const DEFAULT_SELECTION: ClientConnectionSettings['client'] = 'rTorrent' as const;

interface ClientConnectionSettingsFormProps {
  onSettingsChange: (settings: ClientConnectionSettings | null) => void;
}

const ClientConnectionSettingsForm: FC<ClientConnectionSettingsFormProps> = ({
  onSettingsChange,
}: ClientConnectionSettingsFormProps) => {
  const {i18n} = useLingui();
  const [selectedClient, setSelectedClient] = useState<ClientConnectionSettings['client']>(DEFAULT_SELECTION);

  useEffect(() => {
    onSettingsChange(null);
  }, [selectedClient, onSettingsChange]);

  let settingsForm: ReactNode = null;
  switch (selectedClient) {
    case 'qBittorrent':
      settingsForm = <QBittorrentConnectionSettingsForm onSettingsChange={onSettingsChange} />;
      break;
    case 'rTorrent':
      settingsForm = <RTorrentConnectionSettingsForm onSettingsChange={onSettingsChange} />;
      break;
    case 'Transmission':
      settingsForm = <TransmissionConnectionSettingsForm onSettingsChange={onSettingsChange} />;
      break;
    default:
      break;
  }

  return (
    <div>
      <FormRow>
        <Select
          id="client"
          label={i18n._('connection.settings.client.select')}
          onSelect={(newSelectedClient) => {
            setSelectedClient(newSelectedClient as ClientConnectionSettings['client']);
          }}
          defaultID={DEFAULT_SELECTION}>
          {SUPPORTED_CLIENTS.map((client) => (
            <SelectItem key={client} id={client}>
              <Trans id={`connection.settings.${client.toLowerCase()}`} />
            </SelectItem>
          ))}
        </Select>
      </FormRow>
      {settingsForm}
    </div>
  );
};

export default ClientConnectionSettingsForm;
