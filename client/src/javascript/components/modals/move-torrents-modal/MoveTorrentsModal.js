import {injectIntl} from 'react-intl';
import React from 'react';

import {Form} from '../../../ui';
import Modal from '../Modal';
import ModalActions from '../ModalActions';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';
import TorrentStore from '../../../stores/TorrentStore';

class MoveTorrents extends React.Component {
  constructor(props) {
    super(props);
    const filenames = TorrentStore.getSelectedTorrentsFilename();
    const sources = TorrentStore.getSelectedTorrentsDownloadLocations();

    this.state = {
      isSettingDownloadPath: false,
      originalSource: sources.length === 1 ? this.removeTrailingFilename(sources[0], filenames[0]) : null,
    };
  }

  getActions() {
    return [
      {
        checked: false,
        content: this.props.intl.formatMessage({
          id: 'torrents.move.data.label',
        }),
        id: 'moveFiles',
        type: 'checkbox',
      },
      {
        checked: true,
        content: this.props.intl.formatMessage({
          id: 'torrents.move.check_hash.label',
        }),
        id: 'isCheckHash',
        type: 'checkbox',
      },
      {
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
        }),
        triggerDismiss: true,
        type: 'tertiary',
      },
      {
        content: this.props.intl.formatMessage({
          id: 'torrents.move.button.set.location',
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
        isCheckHash: formData.isCheckHash,
      }).then(() => {
        this.setState({isSettingDownloadPath: false});
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
        })}
      />
    );
  }
}

export default injectIntl(MoveTorrents);
