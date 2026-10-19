import classnames from 'classnames';
import React, {FC, useLayoutEffect, useRef} from 'react';
import {useTransitionMap} from 'react-transition-state';
import {observer} from 'mobx-react-lite';
import {useKeyPressEvent} from 'react-use';

import {getTransitionClassName} from '@client/ui';

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
  const previousID = useRef<Modal['id'] | null>(null);
  const {setItem, stateMap, toggle} = useTransitionMap<Modal['id']>({
    allowMultiple: true,
    mountOnEnter: true,
    preEnter: true,
    preExit: true,
    timeout: {enter: 500, exit: 500},
    unmountOnExit: true,
  });

  useLayoutEffect(() => {
    if (id != null) {
      if (!stateMap.has(id)) {
        setItem(id);
      }
      toggle(id, true);
    }

    if (previousID.current != null && previousID.current !== id) {
      toggle(previousID.current, false);
    }

    previousID.current = id ?? null;
  }, [id, setItem, stateMap, toggle]);

  useKeyPressEvent('Escape', () => UIStore.setActiveModal(null));

  return (
    <>
      {Array.from(stateMap).map(([modalID, state]) =>
        state.isMounted ? (
          <div className={classnames('modal', getTransitionClassName('modal__animation', state.status))} key={modalID}>
            <div
              className="modal__overlay"
              role="none"
              onClick={() => {
                UIStore.setActiveModal(null);
              }}
            />
            {createModal(modalID)}
          </div>
        ) : null,
      )}
    </>
  );
});

export default Modals;
