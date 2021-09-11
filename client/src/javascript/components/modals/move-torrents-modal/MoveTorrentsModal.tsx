import {FC, useState} from 'react';
import {useLingui} from '@lingui/react';

import {Form} from '@client/ui';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import FilesystemBrowserTextbox from '../../general/form-elements/FilesystemBrowserTextbox';
import Modal from '../Modal';
import ModalActions from '../ModalActions';

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

const MoveTorrents: FC = () => {
  const {i18n} = useLingui();
  const [isSettingDownloadPath, setIsSettingDownloadPath] = useState<boolean>(false);

  return (
    <Modal
      heading={i18n._('torrents.move.heading')}
      content={
        <div className="modal__content">
          <Form
            className="inverse"
            onSubmit={({formData}) => {
              const hashes = TorrentStore.selectedTorrents;
              if (hashes.length > 0) {
                setIsSettingDownloadPath(true);
                TorrentActions.moveTorrents({
                  hashes,
                  destination: formData.destination as string,
                  isBasePath: formData.isBasePath as boolean,
                  moveFiles: formData.moveFiles as boolean,
                  isCheckHash: formData.isCheckHash as boolean,
                }).then(() => {
                  UIStore.dismissModal();
                  setIsSettingDownloadPath(false);
                });
              }
            }}
          >
            <FilesystemBrowserTextbox
              id="destination"
              selectable="directories"
              suggested={getSuggestedPath(
                TorrentStore.selectedTorrents.map((hash: string) => TorrentStore.torrents[hash].directory),
              )}
              showBasePathToggle
            />
            <ModalActions
              actions={[
                {
                  checked: true,
                  content: i18n._('torrents.move.data.label'),
                  id: 'moveFiles',
                  type: 'checkbox',
                },
                {
                  checked: false,
                  content: i18n._('torrents.move.check_hash.label'),
                  id: 'isCheckHash',
                  type: 'checkbox',
                },
                {
                  content: i18n._('button.cancel'),
                  triggerDismiss: true,
                  type: 'tertiary',
                },
                {
                  content: i18n._('torrents.move.button.set.location'),
                  isLoading: isSettingDownloadPath,
                  submit: true,
                  type: 'primary',
                },
              ]}
            />
          </Form>
        </div>
      }
    />
  );
};

export default MoveTorrents;
