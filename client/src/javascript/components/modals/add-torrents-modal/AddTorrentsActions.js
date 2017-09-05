import {injectIntl} from 'react-intl';
import React from 'react';

import LoadingIndicatorDots from '../../icons/LoadingIndicatorDots';
import ModalActions from '../ModalActions';
import SettingsStore from '../../../stores/SettingsStore';

const METHODS_TO_BIND = ['handleStartTorrentsToggle'];

class AddTorrentsActions extends React.Component {
  constructor() {
    super();

    this.state = {
      startTorrentsOnLoad: true
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    let startTorrentsOnLoad = SettingsStore.getFloodSettings(
      'startTorrentsOnLoad');
    if (startTorrentsOnLoad !== true) {
      this.setState({startTorrentsOnLoad: false});
    }
  }

  getActions() {
    let icon = null;
    let primaryButtonText = this.props.intl.formatMessage({
      id: 'torrents.add.button.add',
      defaultMessage: 'Add Torrent'
    });

    if (this.props.isAddingTorrents) {
      icon = <LoadingIndicatorDots viewBox="0 0 32 32" />;
      primaryButtonText = this.props.intl.formatMessage({
        id: 'button.state.adding',
        defaultMessage: 'Adding...'
      });
    }

    return [
      {
        checked: this.state.startTorrentsOnLoad,
        clickHandler: this.handleStartTorrentsToggle,
        content: this.props.intl.formatMessage({
          id: 'torrents.add.start.label',
          defaultMessage: 'Start Torrent'
        }),
        id: 'start',
        triggerDismiss: false,
        type: 'checkbox'
      },
      {
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
          defaultMessage: 'Cancel'
        }),
        triggerDismiss: true,
        type: 'tertiary'
      },
      {
        clickHandler: this.props.onAddTorrentsClick,
        content: (
          <span>
            {icon}
            {primaryButtonText}
          </span>
        ),
        supplementalClassName: icon != null ? 'has-icon' : '',
        triggerDismiss: false,
        type: 'primary'
      }
    ];
  }

  handleStartTorrentsToggle(event) {
    SettingsStore.saveFloodSettings({id: 'startTorrentsOnLoad', data: event.target.checked});
    if (this.props.onStartTorrentsToggle) {
      this.props.onStartTorrentsToggle(event.target.checked);
    }
  }

  render() {
    return (
      <ModalActions actions={this.getActions()} dismiss={this.props.dismiss} />
    );
  }
}

export default injectIntl(AddTorrentsActions);
