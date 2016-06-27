import React from 'react';

import LoadingIndicatorDots from '../../Icons/LoadingIndicatorDots';
import ModalActions from '../ModalActions';
import SettingsStore from '../../../stores/SettingsStore';

const METHODS_TO_BIND = ['handleStartTorrentsToggle'];

export default class AddTorrentsActions extends React.Component {
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
    let primaryButtonText = 'Add Torrent';

    if (this.props.isAddingTorrents) {
      icon = <LoadingIndicatorDots viewBox="0 0 32 32" />;
      primaryButtonText = 'Adding...';
    }

    return [
      {
        checked: this.state.startTorrentsOnLoad,
        clickHandler: this.handleStartTorrentsToggle,
        content: 'Start Torrent',
        triggerDismiss: false,
        type: 'checkbox'
      },
      {
        clickHandler: null,
        content: 'Cancel',
        triggerDismiss: true,
        type: 'secondary'
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

  handleStartTorrentsToggle(value) {
    SettingsStore.saveFloodSettings({id: 'startTorrentsOnLoad', data: value});
    if (!!this.props.onStartTorrentsToggle) {
      this.props.onStartTorrentsToggle(value);
    }
  }

  render() {
    return (
      <ModalActions actions={this.getActions()} dismiss={this.props.dismiss} />
    );
  }
}
