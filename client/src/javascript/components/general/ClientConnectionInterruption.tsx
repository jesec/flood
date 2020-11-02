import {FormattedMessage} from 'react-intl';
import {observer} from 'mobx-react';
import * as React from 'react';

import {Button, Form, FormRow, Panel, PanelContent, PanelHeader, PanelFooter} from '../../ui';
import AuthActions from '../../actions/AuthActions';
import AuthStore from '../../stores/AuthStore';
import ClientConnectionSettingsForm from './connection-settings/ClientConnectionSettingsForm';
import FloodActions from '../../actions/FloodActions';

import type {ClientConnectionSettingsFormType} from './connection-settings/ClientConnectionSettingsForm';

const ClientConnectionInterruption: React.FC = () => {
  const settingsFormRef = React.useRef<ClientConnectionSettingsFormType>(null);

  if (!AuthStore.currentUser.isAdmin && !AuthStore.currentUser.isInitialUser) {
    return (
      <Panel spacing="large">
        <PanelHeader>
          <h1>
            <FormattedMessage id="connection-interruption.heading" />
          </h1>
        </PanelHeader>
      </Panel>
    );
  }

  return (
    <Panel spacing="large">
      <Form
        onSubmit={() => {
          const currentUsername = AuthStore.currentUser.username;

          if (currentUsername == null) {
            return;
          }

          const connectionSettings = settingsFormRef.current?.getConnectionSettings();
          if (connectionSettings == null) {
            return;
          }

          AuthActions.updateUser(currentUsername, {client: connectionSettings})
            .then(() => {
              FloodActions.restartActivityStream();
            })
            .catch(() => {
              // do nothing.
            });
        }}>
        <PanelHeader>
          <h1>
            <FormattedMessage id="connection-interruption.heading" />
          </h1>
        </PanelHeader>
        <PanelContent>
          <ClientConnectionSettingsForm ref={settingsFormRef} />
        </PanelContent>
        <PanelFooter hasBorder>
          <FormRow justify="end">
            <Button type="submit">
              <FormattedMessage id="button.save" />
            </Button>
          </FormRow>
        </PanelFooter>
      </Form>
    </Panel>
  );
};

export default observer(ClientConnectionInterruption);
