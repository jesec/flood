import {IntlShape} from 'react-intl';
import * as React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import ConfigStore from '../../stores/ConfigStore';
import PriorityMeter from '../general/filesystem/PriorityMeter';
import TorrentActions from '../../actions/TorrentActions';
import TorrentContextMenuActions from '../../constants/TorrentContextMenuActions';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

import type {ContextMenuItem} from '../../stores/UIStore';
import type {PriorityMeterType} from '../general/filesystem/PriorityMeter';
import type {TorrentContextMenuAction} from '../../constants/TorrentContextMenuActions';

const priorityMeterRef: React.RefObject<PriorityMeterType> = React.createRef();
let prioritySelected = 1;

const handleDetailsClick = (hash: string): void => {
  UIActions.displayModal({
    id: 'torrent-details',
    hash,
  });
};

const handleTorrentDownload = (torrent: TorrentProperties, event: React.MouseEvent): void => {
  event.preventDefault();
  const {baseURI} = ConfigStore;
  const link = document.createElement('a');

  link.download = '';
  link.href = `${baseURI}api/torrents/${torrent.hash}/contents/all/data`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleItemClick = (action: TorrentContextMenuAction, event: React.MouseEvent): void => {
  const {selectedTorrents} = TorrentStore;
  switch (action) {
    case 'checkHash':
      TorrentActions.checkHash({
        hashes: selectedTorrents,
      });
      break;
    case 'setTaxonomy':
      UIActions.displayModal({id: 'set-taxonomy'});
      break;
    case 'setTrackers':
      UIActions.displayModal({id: 'set-trackers'});
      break;
    case 'start':
      TorrentActions.startTorrents({
        hashes: selectedTorrents,
      });
      break;
    case 'stop':
      TorrentActions.stopTorrents({
        hashes: selectedTorrents,
      });
      break;
    case 'remove':
      UIActions.displayModal({id: 'remove-torrents'});
      break;
    case 'move':
      UIActions.displayModal({id: 'move-torrents'});
      break;
    case 'torrentDetails':
      handleDetailsClick(selectedTorrents[selectedTorrents.length - 1]);
      break;
    case 'torrentDownload':
      handleTorrentDownload(TorrentStore.torrents[selectedTorrents[selectedTorrents.length - 1]], event);
      break;
    case 'setPriority':
      if (priorityMeterRef.current != null) {
        priorityMeterRef.current.handleClick();
      }
      TorrentActions.setPriority({
        hashes: selectedTorrents,
        priority: prioritySelected,
      });
      break;
    default:
      break;
  }
};

const getContextMenuItems = (intl: IntlShape, torrent: TorrentProperties): Array<ContextMenuItem> => {
  const clickHandler = handleItemClick;

  return [
    {
      type: 'action',
      action: 'start',
      label: intl.formatMessage(TorrentContextMenuActions.start),
      clickHandler,
    },
    {
      type: 'action',
      action: 'stop',
      label: intl.formatMessage(TorrentContextMenuActions.stop),
      clickHandler,
    },
    {
      type: 'action',
      action: 'remove',
      label: intl.formatMessage(TorrentContextMenuActions.remove),
      clickHandler,
    },
    {
      type: 'action',
      action: 'checkHash',
      label: intl.formatMessage(TorrentContextMenuActions.checkHash),
      clickHandler,
    },
    {
      type: 'separator',
    },
    {
      type: 'action',
      action: 'setTaxonomy',
      label: intl.formatMessage(TorrentContextMenuActions.setTaxonomy),
      clickHandler,
    },
    {
      type: 'action',
      action: 'move',
      label: intl.formatMessage(TorrentContextMenuActions.move),
      clickHandler,
    },
    {
      type: 'action',
      action: 'setTrackers',
      label: intl.formatMessage(TorrentContextMenuActions.setTrackers),
      clickHandler,
    },
    {
      type: 'separator',
    },
    {
      type: 'action',
      action: 'torrentDetails',
      label: intl.formatMessage(TorrentContextMenuActions.torrentDetails),
      clickHandler,
    },
    {
      type: 'action',
      action: 'torrentDownload',
      label: intl.formatMessage(TorrentContextMenuActions.torrentDownload),
      clickHandler,
    },
    {
      type: 'action',
      action: 'setPriority',
      label: intl.formatMessage(TorrentContextMenuActions.setPriority),
      clickHandler,
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
  handleDetailsClick,
};
