import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import type {MoveTorrentsOptions} from '@shared/types/Action';

import {Form} from '../../../ui';
import Modal from '../Modal';
import ModalActions from '../ModalActions';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';
import TorrentStore from '../../../stores/TorrentStore';

interface MoveTorrentsStates {
  isSettingDownloadPath: boolean;
  originalSource?: string;
}

const removeTrailingFilename = (path: string, filename: string): string => {
  let directoryPath = path.substring(0, path.length - filename.length);

  if (
    directoryPath.charAt(directoryPath.length - 1) === '/' ||
    directoryPath.charAt(directoryPath.length - 1) === '\\'
  ) {
    directoryPath = directoryPath.substring(0, directoryPath.length - 1);
  }

  return directoryPath;
};

class MoveTorrents extends React.Component<WrappedComponentProps, MoveTorrentsStates> {
  constructor(props: WrappedComponentProps) {
    super(props);
    const filenames = TorrentStore.getSelectedTorrentsFilename();
    const sources = TorrentStore.getSelectedTorrentsDownloadLocations();

    this.state = {
      isSettingDownloadPath: false,
      originalSource: sources.length === 1 ? removeTrailingFilename(sources[0], filenames[0]) : undefined,
    };
  }

  getActions(): ModalActions['props']['actions'] {
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

  getContent(): React.ReactNode {
    return (
      <div className="modal__content">
        <Form
          className="inverse"
          onSubmit={({event: _e, formData}) => {
            return this.handleFormSubmit((formData as unknown) as MoveTorrentsOptions);
          }}>
          <TorrentDestination id="destination" suggested={this.state.originalSource} />
          <ModalActions actions={this.getActions()} />
        </Form>
      </div>
    );
  }

  handleFormSubmit = (formData: MoveTorrentsOptions) => {
    const filenames = TorrentStore.getSelectedTorrentsFilename();
    const sourcePaths = TorrentStore.getSelectedTorrentsDownloadLocations();

    if (sourcePaths.length) {
      this.setState({isSettingDownloadPath: true});
      TorrentActions.moveTorrents({
        hashes: TorrentStore.getSelectedTorrents(),
        destination: formData.destination,
        isBasePath: formData.isBasePath,
        filenames,
        moveFiles: formData.moveFiles,
        sourcePaths,
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
