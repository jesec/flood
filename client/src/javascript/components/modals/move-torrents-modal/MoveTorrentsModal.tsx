import {FC, useState} from 'react';
import {useIntl} from 'react-intl';

import FilesystemBrowserTextbox from '../../general/filesystem/FilesystemBrowserTextbox';
import {Form} from '../../../ui';
import Modal from '../Modal';
import ModalActions from '../ModalActions';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';
import UIStore from '../../../stores/UIStore';

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
  const intl = useIntl();
  const [isSettingDownloadPath, setIsSettingDownloadPath] = useState<boolean>(false);

  return (
    <Modal
      heading={intl.formatMessage({
        id: 'torrents.move.heading',
      })}
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
            }}>
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
                  content: intl.formatMessage({
                    id: 'torrents.move.data.label',
                  }),
                  id: 'moveFiles',
                  type: 'checkbox',
                },
                {
                  checked: false,
                  content: intl.formatMessage({
                    id: 'torrents.move.check_hash.label',
                  }),
                  id: 'isCheckHash',
                  type: 'checkbox',
                },
                {
                  content: intl.formatMessage({
                    id: 'button.cancel',
                  }),
                  triggerDismiss: true,
                  type: 'tertiary',
                },
                {
                  content: intl.formatMessage({
                    id: 'torrents.move.button.set.location',
                  }),
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
