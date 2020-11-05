import {FormattedMessage} from 'react-intl';
import {observer} from 'mobx-react';
import * as React from 'react';

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
} from '../../ui';
import AuthActions from '../../actions/AuthActions';
import AuthStore from '../../stores/AuthStore';
import ClientActions from '../../actions/ClientActions';
import ClientConnectionSettingsForm from './connection-settings/ClientConnectionSettingsForm';
import FloodActions from '../../actions/FloodActions';

import type {ClientConnectionSettingsFormType} from './connection-settings/ClientConnectionSettingsForm';

const ClientConnectionInterruption: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [selection, setSelection] = React.useState<React.ReactText>('retry');
  const settingsFormRef = React.useRef<ClientConnectionSettingsFormType>(null);

  return (
    <Panel spacing="large">
      <Form
        onSubmit={async () => {
          setSubmitting(true);

          if (selection === 'config') {
            const currentUsername = AuthStore.currentUser.username;
            const connectionSettings = settingsFormRef.current?.getConnectionSettings();

            if (currentUsername == null || connectionSettings == null) {
              setError('connection.settings.error.empty');
              setSubmitting(false);
              return;
            }

            try {
              await AuthActions.updateUser(currentUsername, {client: connectionSettings})
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
          {selection === 'config' && <ClientConnectionSettingsForm ref={settingsFormRef} />}
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
};

export default observer(ClientConnectionInterruption);
