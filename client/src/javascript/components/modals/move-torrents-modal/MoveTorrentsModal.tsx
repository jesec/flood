import {injectIntl, WrappedComponentProps} from 'react-intl';
import * as React from 'react';

import type {MoveTorrentsOptions} from '@shared/types/api/torrents';

import FilesystemBrowserTextbox from '../../general/filesystem/FilesystemBrowserTextbox';
import {Form} from '../../../ui';
import Modal from '../Modal';
import ModalActions from '../ModalActions';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';
import UIStore from '../../../stores/UIStore';

import type {ModalAction} from '../../../stores/UIStore';

interface MoveTorrentsStates {
  isSettingDownloadPath: boolean;
  originalSource?: string;
}

const getSuggestedPath = (sources: Array<string>): string | undefined => {
  const commonPath = sources[0];

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
        TorrentStore.selectedTorrents.map((hash: string) => TorrentStore.torrents[hash].directory),
      ),
    };
  }

  getActions(): Array<ModalAction> {
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
            showBasePathToggle
          />
          <ModalActions actions={this.getActions()} />
        </Form>
      </div>
    );
  }

  handleFormSubmit = (formData: MoveTorrentsOptions) => {
    const hashes = TorrentStore.selectedTorrents;
    if (hashes.length > 0) {
      this.setState({isSettingDownloadPath: true});
      TorrentActions.moveTorrents({
        hashes,
        destination: formData.destination,
        isBasePath: formData.isBasePath,
        moveFiles: formData.moveFiles,
        isCheckHash: formData.isCheckHash,
      }).then(() => {
        UIStore.dismissModal();
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
