import {createRef, RefObject} from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import ConfigStore from '../../stores/ConfigStore';
import PriorityMeter from '../general/filesystem/PriorityMeter';
import TorrentActions from '../../actions/TorrentActions';
import TorrentContextMenuActions from '../../constants/TorrentContextMenuActions';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

import type {ContextMenuItem} from '../../stores/UIStore';
import type {PriorityMeterType} from '../general/filesystem/PriorityMeter';

const priorityMeterRef: RefObject<PriorityMeterType> = createRef();
let prioritySelected = 1;

const handleTorrentDownload = (hash: TorrentProperties['hash']): void => {
  const {baseURI} = ConfigStore;
  const link = document.createElement('a');

  link.download = '';
  link.href = `${baseURI}api/torrents/${hash}/contents/all/data`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getContextMenuItems = (torrent: TorrentProperties): Array<ContextMenuItem> => {
  return [
    {
      type: 'action',
      action: 'start',
      label: TorrentContextMenuActions.start.id,
      clickHandler: () => {
        TorrentActions.startTorrents({
          hashes: TorrentStore.selectedTorrents,
        });
      },
    },
    {
      type: 'action',
      action: 'stop',
      label: TorrentContextMenuActions.stop.id,
      clickHandler: () => {
        TorrentActions.stopTorrents({
          hashes: TorrentStore.selectedTorrents,
        });
      },
    },
    {
      type: 'action',
      action: 'remove',
      label: TorrentContextMenuActions.remove.id,
      clickHandler: () => {
        UIActions.displayModal({id: 'remove-torrents'});
      },
    },
    {
      type: 'action',
      action: 'checkHash',
      label: TorrentContextMenuActions.checkHash.id,
      clickHandler: () => {
        TorrentActions.checkHash({
          hashes: TorrentStore.selectedTorrents,
        });
      },
    },
    {
      type: 'separator',
    },
    {
      type: 'action',
      action: 'setTaxonomy',
      label: TorrentContextMenuActions.setTaxonomy.id,
      clickHandler: () => {
        UIActions.displayModal({id: 'set-taxonomy'});
      },
    },
    {
      type: 'action',
      action: 'move',
      label: TorrentContextMenuActions.move.id,
      clickHandler: () => {
        UIActions.displayModal({id: 'move-torrents'});
      },
    },
    {
      type: 'action',
      action: 'setTrackers',
      label: TorrentContextMenuActions.setTrackers.id,
      clickHandler: () => {
        UIActions.displayModal({id: 'set-trackers'});
      },
    },
    {
      type: 'separator',
    },
    {
      type: 'action',
      action: 'torrentDetails',
      label: TorrentContextMenuActions.torrentDetails.id,
      clickHandler: () => {
        const {selectedTorrents} = TorrentStore;
        UIActions.displayModal({
          id: 'torrent-details',
          hash: selectedTorrents[selectedTorrents.length - 1],
        });
      },
    },
    {
      type: 'action',
      action: 'torrentDownload',
      label: TorrentContextMenuActions.torrentDownload.id,
      clickHandler: (e) => {
        const {selectedTorrents} = TorrentStore;
        e.preventDefault();
        handleTorrentDownload(selectedTorrents[selectedTorrents.length - 1]);
      },
    },
    {
      type: 'action',
      action: 'setPriority',
      label: TorrentContextMenuActions.setPriority.id,
      clickHandler: () => {
        if (priorityMeterRef.current != null) {
          priorityMeterRef.current.handleClick();
        }
        TorrentActions.setPriority({
          hashes: TorrentStore.selectedTorrents,
          priority: prioritySelected,
        });
      },
      dismissMenu: false,
      labelAction: () => (
        <PriorityMeter
          id={torrent.hash}
          key={torrent.hash}
          ref={priorityMeterRef}
          level={torrent.priority}
          maxLevel={3}
          priorityType="torrent"
          onChange={(_id, level) => {
            prioritySelected = level;
          }}
          showLabel={false}
          clickHandled
        />
      ),
    },
  ];
};

export default {
  getContextMenuItems,
};
