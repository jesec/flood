import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import type {MoveTorrentsOptions} from '@shared/types/api/torrents';

import FilesystemBrowserTextbox from '../../general/filesystem/FilesystemBrowserTextbox';
import {Form} from '../../../ui';
import Modal from '../Modal';
import ModalActions from '../ModalActions';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';

interface MoveTorrentsStates {
  isSettingDownloadPath: boolean;
  originalSource?: string;
}

const getSuggestedPath = (sources: Array<string>, filenames: Array<string>): string | undefined => {
  let commonPath = sources[0].substring(0, sources[0].length - filenames[0].length);

  // Remove trailing slash
  if (commonPath.charAt(commonPath.length - 1) === '/' || commonPath.charAt(commonPath.length - 1) === '\\') {
    commonPath = commonPath.substring(0, commonPath.length - 1);
  }

  if (
    !sources.some((path) => {
      if (!path.includes(commonPath)) {
        // Bail out if at least one selected torrent doesn't match.
        return true;
      }
      return false;
    })
  ) {
    // If every selected torrent shares a common path, suggest it.
    return commonPath;
  }

  // Fallback to default download location.
  return undefined;
};

class MoveTorrents extends React.Component<WrappedComponentProps, MoveTorrentsStates> {
  constructor(props: WrappedComponentProps) {
    super(props);

    this.state = {
      isSettingDownloadPath: false,
      originalSource: getSuggestedPath(
        TorrentStore.getSelectedTorrentsDownloadLocations(),
        TorrentStore.getSelectedTorrentsFilename(),
      ),
    };
  }

  getActions(): ModalActions['props']['actions'] {
    return [
      {
        checked: true,
        content: this.props.intl.formatMessage({
          id: 'torrents.move.data.label',
        }),
        id: 'moveFiles',
        type: 'checkbox',
      },
      {
        checked: false,
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

  getContent(): React.ReactNode {
    return (
      <div className="modal__content">
        <Form
          className="inverse"
          onSubmit={({event: _e, formData}) => {
            return this.handleFormSubmit((formData as unknown) as MoveTorrentsOptions);
          }}>
          <FilesystemBrowserTextbox
            id="destination"
            selectable="directories"
            suggested={this.state.originalSource}
            basePathToggle
          />
          <ModalActions actions={this.getActions()} />
        </Form>
      </div>
    );
  }

  handleFormSubmit = (formData: MoveTorrentsOptions) => {
    const hashes = TorrentStore.getSelectedTorrents();
    if (hashes.length > 0) {
      this.setState({isSettingDownloadPath: true});
      TorrentActions.moveTorrents({
        hashes,
        destination: formData.destination,
        isBasePath: formData.isBasePath,
        moveFiles: formData.moveFiles,
        isCheckHash: formData.isCheckHash,
      }).then(() => {
        this.setState({isSettingDownloadPath: false});
      });
    }
  };

  render() {
    return (
      <Modal
        content={this.getContent()}
        heading={this.props.intl.formatMessage({
          id: 'torrents.move.heading',
        })}
      />
    );
  }
}

export default injectIntl(MoveTorrents);
