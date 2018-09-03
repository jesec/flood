import {
  Button,
  Form,
  FormError,
  FormRow,
  FormRowItem,
  Panel,
  PanelContent,
  PanelHeader,
  PanelFooter,
} from 'flood-ui-kit';
import {FormattedMessage} from 'react-intl';
import React from 'react';

import AuthActions from '../../actions/AuthActions';
import AuthStore from '../../stores/AuthStore';
import Checkmark from '../icons/Checkmark';
import ClientActions from '../../actions/ClientActions';
import FloodActions from '../../actions/FloodActions';
import RtorrentConnectionTypeSelection from './RtorrentConnectionTypeSelection';

export default class ClientConnectionInterruption extends React.Component {
  state = {
    hasTestedConnection: false,
    isConnectionVerified: false,
    isTestingConnection: false,
  };

  handleFormChange = () => {
    if (this.state.hasTestedConnection) {
      this.setState({
        isConnectionVerified: false,
        hasTestedConnection: false,
      });
    }
  };

  handleFormSubmit = ({formData}) => {
    this.setState({
      isSavingSettings: true,
    });

    AuthActions.updateUser(AuthStore.getCurrentUsername(), formData)
      .then(() => {
        FloodActions.restartActivityStream();
      })
      .catch(error => {
        this.setState({
          isSavingSettings: false,
        });
      });
  };

  handleTestButtonClick = () => {
    if (this.state.isTestingConnection) return;
    const formData = this.formRef.getFormData();

    this.setState(
      {
        isTestingConnection: true,
      },
      () => {
        ClientActions.testClientConnectionSettings(formData)
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
      }
    );
  };

  renderConnectionTestResult() {
    const {hasTestedConnection, isConnectionVerified} = this.state;
    if (!hasTestedConnection || !isConnectionVerified) return null;
    return (
      <FormRowItem className="connection-status">
        <Checkmark className="connection-status__icon" />
        <span className="connection-status__copy">
          <FormattedMessage id="connection-interruption.verification-success" defaultMessage="Connection successful" />
        </span>
      </FormRowItem>
    );
  }

  renderFormError() {
    const {hasTestedConnection, isConnectionVerified, isTestingConnection} = this.state;
    if (hasTestedConnection && !isConnectionVerified) {
      return (
        <FormRow>
          <FormError isLoading={isTestingConnection}>
            <FormattedMessage
              id="connection-interruption.verification-error"
              defaultMessage="Connection could not be verified."
            />
          </FormError>
        </FormRow>
      );
    }
  }

  render() {
    const {isConnectionVerified, isTestingConnection} = this.state;

    return (
      <Panel spacing="large">
        <Form onChange={this.handleFormChange} onSubmit={this.handleFormSubmit} ref={ref => (this.formRef = ref)}>
          <PanelHeader>
            <h1>
              <FormattedMessage id="connection-interruption.heading" defaultMessage="Cannot connect to rTorrent" />
            </h1>
          </PanelHeader>
          <PanelContent>
            <p className="copy--lead">
              <FormattedMessage
                id="connection-interruption.verify-settings-prompt"
                defaultMessage="Let's verify your connection settings."
              />
            </p>
            {this.renderFormError()}
            <RtorrentConnectionTypeSelection isDisabled={isTestingConnection} />
          </PanelContent>
          <PanelFooter hasBorder>
            <FormRow justify="end">
              {this.renderConnectionTestResult()}
              <Button isLoading={isTestingConnection} priority="tertiary" onClick={this.handleTestButtonClick}>
                <FormattedMessage id="button.test" defaultMessage="Test" />
              </Button>
              <Button type="submit" disabled={!isConnectionVerified}>
                <FormattedMessage id="button.save" defaultMessage="Save Settings" />
              </Button>
            </FormRow>
          </PanelFooter>
        </Form>
      </Panel>
    );
  }
}
