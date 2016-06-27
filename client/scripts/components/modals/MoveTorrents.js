import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';

import AddTorrentsDestination from './AddTorrentsDestination';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import Checkbox from '../forms/Checkbox';
import EventTypes from '../../constants/EventTypes';
import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import Modal from './Modal';
import ModalActions from './ModalActions';
import TorrentActions from '../../actions/TorrentActions';
import TorrentStore from '../../stores/TorrentStore';

const METHODS_TO_BIND = [
  'confirmMoveTorrents',
  'handleCheckboxChange',
  'handleDestinationChange',
  'handleTextboxChange',
  'onMoveError'
];

export default class MoveTorrents extends React.Component {
  constructor() {
    super();

    this.state = {
      moveTorrentsError: null,
      destination: null,
      isExpanded: false,
      isSettingDownloadPath: false,
      moveTorrents: false,
      originalSource: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    let filenames = TorrentStore.getSelectedTorrentsFilename();
    let sources = TorrentStore.getSelectedTorrentsDownloadLocations();

    if (sources.length === 1) {
      let originalSource = this.removeTrailingFilename(sources[0], filenames[0]);
      this.setState({originalSource, destination: originalSource});
    }
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_MOVE_TORRENTS_REQUEST_ERROR, this.onMoveError);
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_MOVE_TORRENTS_REQUEST_ERROR, this.onMoveError);
  }

  onMoveError() {
    this.setState({isSettingDownloadPath: false});
  }

  confirmMoveTorrents() {
    let filenames = TorrentStore.getSelectedTorrentsFilename();
    let sources = TorrentStore.getSelectedTorrentsDownloadLocations();

    if (sources.length) {
      this.setState({isSettingDownloadPath: true});
      TorrentActions.moveTorrents(TorrentStore.getSelectedTorrents(), {
        destination: this.state.destination,
        filenames,
        moveFiles: this.state.moveTorrents,
        sources
      });
    }
  }

  getActions() {
    let icon = null;
    let primaryButtonText = 'Set Location';

    if (this.state.isSettingDownloadPath) {
      icon = <LoadingIndicatorDots viewBox="0 0 32 32" />;
      primaryButtonText = 'Setting...';
    }

    return [
      {
        clickHandler: null,
        content: 'Cancel',
        triggerDismiss: true,
        type: 'secondary'
      },
      {
        clickHandler: this.confirmMoveTorrents,
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

  handleCheckboxChange(checkboxState) {
    this.setState({moveTorrents: checkboxState});
  }

  handleDestinationChange(destination) {
    this.setState({destination});
  }

  handleTextboxChange(event) {
    let destination = event.target.value;
    this.setState({destination});
  }

  getContent() {
    return (
      <div className="form modal__content">
        <AddTorrentsDestination onChange={this.handleDestinationChange}
          suggested={this.state.originalSource} />
        <div className="form__row">
          <div className="form__column">
            <Checkbox onChange={this.handleCheckboxChange}>Move data</Checkbox>
          </div>
        </div>
      </div>
    );
  }

  removeTrailingFilename(path, filename) {
    let directoryPath = path.substring(0, path.length - filename.length);

    if (directoryPath.charAt(directoryPath.length - 1) === '/' || directoryPath.charAt(directoryPath.length - 1) === '\\') {
      directoryPath = directoryPath.substring(0, directoryPath.length - 1);
    }

    return directoryPath;
  }

  render() {
    return (
      <Modal actions={this.getActions()}
        content={this.getContent()}
        dismiss={this.props.dismiss}
        heading="Set Download Location" />
    );
  }
}
