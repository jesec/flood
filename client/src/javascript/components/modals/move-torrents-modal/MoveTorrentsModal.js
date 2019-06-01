import {Form} from 'flood-ui-kit';
import {injectIntl} from 'react-intl';
import React from 'react';

import EventTypes from '../../../constants/EventTypes';
import Modal from '../Modal';
import ModalActions from '../ModalActions';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';
import TorrentStore from '../../../stores/TorrentStore';

class MoveTorrents extends React.Component {
  state = {
    isSettingDownloadPath: false,
    originalSource: null,
  };

  componentWillMount() {
    const filenames = TorrentStore.getSelectedTorrentsFilename();
    const sources = TorrentStore.getSelectedTorrentsDownloadLocations();

    if (sources.length === 1) {
      const originalSource = this.removeTrailingFilename(sources[0], filenames[0]);
      this.setState({originalSource});
    }
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_MOVE_TORRENTS_REQUEST_ERROR, this.onMoveError);
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_MOVE_TORRENTS_REQUEST_ERROR, this.onMoveError);
  }

  onMoveError = () => {
    this.setState({isSettingDownloadPath: false});
  };

  getActions() {
    return [
      {
        checked: false,
        content: this.props.intl.formatMessage({
          id: 'torrents.move.data.label',
          defaultMessage: 'Move data',
        }),
        id: 'moveFiles',
        type: 'checkbox',
      },
      {
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
          defaultMessage: 'Cancel',
        }),
        triggerDismiss: true,
        type: 'tertiary',
      },
      {
        content: this.props.intl.formatMessage({
          id: 'torrents.move.button.set.location',
          defaultMessage: 'Set Location',
        }),
        isLoading: this.state.isSettingDownloadPath,
        submit: true,
        type: 'primary',
      },
    ];
  }

  getContent() {
    return (
      <div className="modal__content">
        <Form className="inverse" onChange={this.handleFormChange} onSubmit={this.handleFormSubmit}>
          <TorrentDestination id="destination" suggested={this.state.originalSource} />
          <ModalActions actions={this.getActions()} dismiss={this.props.dismiss} />
        </Form>
      </div>
    );
  }

  handleFormSubmit = ({formData}) => {
    const filenames = TorrentStore.getSelectedTorrentsFilename();
    const sourcePaths = TorrentStore.getSelectedTorrentsDownloadLocations();

    if (sourcePaths.length) {
      this.setState({isSettingDownloadPath: true});
      TorrentActions.moveTorrents(TorrentStore.getSelectedTorrents(), {
        destination: formData.destination,
        isBasePath: formData.useBasePath,
        filenames,
        moveFiles: formData.moveFiles,
        sourcePaths,
      });
    }
  };

  removeTrailingFilename(path, filename) {
    let directoryPath = path.substring(0, path.length - filename.length);

    if (
      directoryPath.charAt(directoryPath.length - 1) === '/' ||
      directoryPath.charAt(directoryPath.length - 1) === '\\'
    ) {
      directoryPath = directoryPath.substring(0, directoryPath.length - 1);
    }

    return directoryPath;
  }

  render() {
    return (
      <Modal
        content={this.getContent()}
        dismiss={this.props.dismiss}
        heading={this.props.intl.formatMessage({
          id: 'torrents.move.heading',
          defaultMessage: 'Set Torrent Location',
        })}
      />
    );
  }
}

export default injectIntl(MoveTorrents);
