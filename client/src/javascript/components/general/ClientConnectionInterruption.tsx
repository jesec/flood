import {FC, ReactText, useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {observer} from 'mobx-react';

import {
  Button,
  Form,
  FormError,
  FormRow,
  Panel,
  PanelContent,
  PanelHeader,
  PanelFooter,
  Select,
  SelectItem,
} from '@client/ui';
import AuthActions from '@client/actions/AuthActions';
import AuthStore from '@client/stores/AuthStore';
import ClientActions from '@client/actions/ClientActions';
import FloodActions from '@client/actions/FloodActions';

import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import ClientConnectionSettingsForm from './connection-settings/ClientConnectionSettingsForm';

const ClientConnectionInterruption: FC = observer(() => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [selection, setSelection] = useState<ReactText>('retry');
  const clientConnectionSettingsRef = useRef<ClientConnectionSettings | null>(null);

  return (
    <Panel spacing="large">
      <Form
        onSubmit={async () => {
          setSubmitting(true);

          if (selection === 'config') {
            const currentUsername = AuthStore.currentUser.username;
            const connectionSettings = clientConnectionSettingsRef.current;

            if (currentUsername == null || connectionSettings == null) {
              setError('connection.settings.error.empty');
              setSubmitting(false);
              return;
            }

            try {
              await AuthActions.updateUser(currentUsername, {
                client: connectionSettings,
              })
                .then(() => {
                  // do nothing.
                })
                .catch((e) => {
                  setError('general.error.unknown');
                  throw e;
                });
            } catch {
              setSubmitting(false);
              return;
            }
          }

          await ClientActions.testConnection()
            .then(() => {
              FloodActions.restartActivityStream();
            })
            .catch(() => {
              setError('connection-interruption.verification-error');
            });

          setSubmitting(false);
        }}>
        <PanelHeader>
          <h1>
            <FormattedMessage id="connection-interruption.heading" />
          </h1>
        </PanelHeader>
        <PanelContent>
          {error && (
            <FormRow>
              <FormError>
                <FormattedMessage id={error} />
              </FormError>
            </FormRow>
          )}
          {AuthStore.currentUser.isAdmin ? (
            <FormRow>
              <Select id="action" onSelect={setSelection} defaultID="retry">
                <SelectItem key="retry" id="retry">
                  <FormattedMessage id="connection-interruption.action.selection.retry" />
                </SelectItem>
                <SelectItem key="config" id="config">
                  <FormattedMessage id="connection-interruption.action.selection.config" />
                </SelectItem>
              </Select>
            </FormRow>
          ) : (
            <p className="copy--lead">
              <FormattedMessage id="connection-interruption.not.admin" />
            </p>
          )}
          {selection === 'config' && (
            <ClientConnectionSettingsForm
              onSettingsChange={(settings) => {
                clientConnectionSettingsRef.current = settings;
              }}
            />
          )}
        </PanelContent>
        <PanelFooter hasBorder>
          <FormRow justify="end">
            {selection === 'retry' && (
              <Button type="submit" isLoading={isSubmitting}>
                <FormattedMessage id="button.retry" />
              </Button>
            )}
            {selection === 'config' && (
              <Button type="submit" isLoading={isSubmitting}>
                <FormattedMessage id="button.save" />
              </Button>
            )}
          </FormRow>
        </PanelFooter>
      </Form>
    </Panel>
  );
});

export default ClientConnectionInterruption;
