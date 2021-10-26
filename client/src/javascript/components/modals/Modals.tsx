import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {FC} from 'react';
import {observer} from 'mobx-react';
import {useKeyPressEvent} from 'react-use';

import AddTorrentsModal from './add-torrents-modal/AddTorrentsModal';
import ConfirmModal from './confirm-modal/ConfirmModal';
import FeedsModal from './feeds-modal/FeedsModal';
import GenerateMagnetModal from './generate-magnet-modal/GenerateMagnetModal';
import MoveTorrentsModal from './move-torrents-modal/MoveTorrentsModal';
import RemoveTorrentsModal from './remove-torrents-modal/RemoveTorrentsModal';
import SetTagsModal from './set-tags-modal/SetTagsModal';
import SetTrackersModal from './set-trackers-modal/SetTrackersModal';
import SettingsModal from './settings-modal/SettingsModal';
import TorrentDetailsModal from './torrent-details-modal/TorrentDetailsModal';
import UIStore from '../../stores/UIStore';

import type {Modal} from '../../stores/UIStore';

const createModal = (id: Modal['id']): React.ReactNode => {
  switch (id) {
    case 'add-torrents':
      return <AddTorrentsModal />;
    case 'confirm':
      return <ConfirmModal />;
    case 'feeds':
      return <FeedsModal />;
    case 'generate-magnet':
      return <GenerateMagnetModal />;
    case 'move-torrents':
      return <MoveTorrentsModal />;
    case 'remove-torrents':
      return <RemoveTorrentsModal />;
    case 'set-taxonomy':
      return <SetTagsModal />;
    case 'set-trackers':
      return <SetTrackersModal />;
    case 'settings':
      return <SettingsModal />;
    case 'torrent-details':
      return <TorrentDetailsModal />;
    default:
      return null;
  }
};

const Modals: FC = observer(() => {
  const {id} = UIStore.activeModal || {};

  useKeyPressEvent('Escape', () => UIStore.setActiveModal(null));

  let modal;
  if (id != null) {
    modal = (
      <CSSTransition key={id} classNames="modal__animation" timeout={{enter: 500, exit: 500}}>
        <div className="modal">
          <div
            className="modal__overlay"
            role="none"
            onClick={() => {
              UIStore.setActiveModal(null);
            }}
          />
          {createModal(id)}
        </div>
      </CSSTransition>
    );
  }

  return <TransitionGroup>{modal}</TransitionGroup>;
});

export default Modals;
