import {FormattedMessage} from 'react-intl';
import React from 'react';

import {Button, Form, FormError, FormRow, FormRowItem, Panel, PanelContent, PanelHeader, PanelFooter} from '../../ui';
import AuthActions from '../../actions/AuthActions';
import AuthStore from '../../stores/AuthStore';
import Checkmark from '../icons/Checkmark';
import ClientActions from '../../actions/ClientActions';
import ClientConnectionSettingsForm from './connection-settings/ClientConnectionSettingsForm';
import connectStores from '../../util/connectStores';
import FloodActions from '../../actions/FloodActions';

import type {ClientConnectionSettingsFormType} from './connection-settings/ClientConnectionSettingsForm';

interface ClientConnectionInterruptionProps {
  isAdmin?: boolean;
  isInitialUser?: boolean;
}

interface ClientConnectionInterruptionStates {
  hasTestedConnection: boolean;
  isConnectionVerified: boolean;
  isTestingConnection: boolean;
}

class ClientConnectionInterruption extends React.Component<
  ClientConnectionInterruptionProps,
  ClientConnectionInterruptionStates
> {
  formRef?: Form | null;
  settingsFormRef: React.RefObject<ClientConnectionSettingsFormType> = React.createRef();

  constructor(props: ClientConnectionInterruptionProps) {
    super(props);
    this.state = {
      hasTestedConnection: false,
      isConnectionVerified: false,
      isTestingConnection: false,
    };
  }

  handleFormChange = () => {
    if (this.state.hasTestedConnection) {
      this.setState({
        isConnectionVerified: false,
        hasTestedConnection: false,
      });
    }
  };

  handleFormSubmit = () => {
    const currentUsername = AuthStore.getCurrentUsername();

    if (currentUsername == null || this.settingsFormRef.current == null) {
      return;
    }

    const connectionSettings = this.settingsFormRef.current.getConnectionSettings();
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
  };

  handleTestButtonClick = () => {
    if (this.state.isTestingConnection || this.formRef == null || this.settingsFormRef.current == null) return;

    const connectionSettings = this.settingsFormRef.current.getConnectionSettings();
    if (connectionSettings == null) {
      return;
    }

    this.setState(
      {
        isTestingConnection: true,
      },
      () => {
        ClientActions.testClientConnectionSettings(connectionSettings)
          .then(() => {
            this.setState({
              hasTestedConnection: true,
              isConnectionVerified: true,
              isTestingConnection: false,
            });
          })
          .catch(() => {
            this.setState({
              hasTestedConnection: true,
              isConnectionVerified: false,
              isTestingConnection: false,
            });
          });
      },
    );
  };

  renderConnectionTestResult() {
    const {hasTestedConnection, isConnectionVerified} = this.state;
    if (!hasTestedConnection || !isConnectionVerified) return null;
    return (
      <FormRowItem className="connection-status">
        <Checkmark className="connection-status__icon" />
        <span className="connection-status__copy">
          <FormattedMessage id="connection-interruption.verification-success" />
        </span>
      </FormRowItem>
    );
  }

  renderFormError(): React.ReactNode {
    const {hasTestedConnection, isConnectionVerified, isTestingConnection} = this.state;
    if (hasTestedConnection && !isConnectionVerified) {
      return (
        <FormRow>
          <FormError isLoading={isTestingConnection}>
            <FormattedMessage id="connection-interruption.verification-error" />
          </FormError>
        </FormRow>
      );
    }
    return undefined;
  }

  render() {
    const {isAdmin, isInitialUser} = this.props;
    const {isConnectionVerified, isTestingConnection} = this.state;

    if (!isAdmin && !isInitialUser) {
      return (
        <Panel spacing="large">
          <PanelHeader>
            <h1>
              <FormattedMessage id="connection-interruption.heading" />
            </h1>
          </PanelHeader>
          <PanelContent>
            <p className="copy--lead">
              <FormattedMessage id="connection-interruption.verify-settings-not-admin" />
            </p>
          </PanelContent>
        </Panel>
      );
    }

    return (
      <Panel spacing="large">
        <Form
          onChange={this.handleFormChange}
          onSubmit={this.handleFormSubmit}
          ref={(ref) => {
            this.formRef = ref;
          }}>
          <PanelHeader>
            <h1>
              <FormattedMessage id="connection-interruption.heading" />
            </h1>
          </PanelHeader>
          <PanelContent>
            <p className="copy--lead">
              <FormattedMessage id="connection-interruption.verify-settings-prompt" />
            </p>
            {this.renderFormError()}
            <ClientConnectionSettingsForm ref={this.settingsFormRef} />
          </PanelContent>
          <PanelFooter hasBorder>
            <FormRow justify="end">
              {this.renderConnectionTestResult()}
              <Button isLoading={isTestingConnection} priority="tertiary" onClick={this.handleTestButtonClick}>
                <FormattedMessage id="button.test" />
              </Button>
              <Button type="submit" disabled={!isConnectionVerified}>
                <FormattedMessage id="button.save" />
              </Button>
            </FormRow>
          </PanelFooter>
        </Form>
      </Panel>
    );
  }
}

const ConnectedClientConnectionInterruption = connectStores(ClientConnectionInterruption, () => {
  return [
    {
      store: AuthStore,
      event: ['AUTH_LOGIN_SUCCESS', 'AUTH_REGISTER_SUCCESS', 'AUTH_VERIFY_SUCCESS', 'AUTH_VERIFY_ERROR'],
      getValue: () => {
        return {
          isAdmin: AuthStore.isAdmin(),
          isInitialUser: AuthStore.getIsInitialUser(),
        };
      },
    },
  ];
});

export default ConnectedClientConnectionInterruption;
