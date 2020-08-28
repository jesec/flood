import React from 'react';

import ConfigStore from '../../stores/ConfigStore';
import PriorityMeter from '../general/filesystem/PriorityMeter';
import TorrentActions from '../../actions/TorrentActions';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

let handleTorrentPriorityChange = (hash, level) => {
  TorrentActions.setPriority(hash, level);
};

const handleDetailsClick = (torrent, event) => {
  UIActions.handleDetailsClick({
    hash: torrent.hash,
    event,
  });

  UIActions.displayModal({
    id: 'torrent-details',
    options: {hash: torrent.hash},
  });
};

const handleTorrentDownload = (torrent, event) => {
  event.preventDefault();
  const baseURI = ConfigStore.getBaseURI();
  const link = document.createElement('a');
  link.download = torrent.isMultiFile ? `${torrent.name}.tar` : torrent.name;
  link.href = `${baseURI}api/download?hash=${torrent.hash}`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
};

const handleItemClick = (action, event, torrent) => {
  const selectedTorrents = TorrentStore.getSelectedTorrents();
  switch (action) {
    case 'check-hash':
      TorrentActions.checkHash(selectedTorrents);
      break;
    case 'set-taxonomy':
      UIActions.displayModal({id: 'set-taxonomy'});
      break;
    case 'set-tracker':
      UIActions.displayModal({id: 'set-tracker'});
      break;
    case 'start':
      TorrentActions.startTorrents(selectedTorrents);
      break;
    case 'stop':
      TorrentActions.stopTorrents(selectedTorrents);
      break;
    case 'remove':
      UIActions.displayModal({id: 'remove-torrents'});
      break;
    case 'move':
      UIActions.displayModal({id: 'move-torrents'});
      break;
    case 'torrent-details':
      handleDetailsClick(torrent, event);
      break;
    case 'torrent-download-tar':
      handleTorrentDownload(torrent, event);
      break;
    case 'set-priority':
      handleTorrentPriorityChange(event);
      break;
    default:
      break;
  }
};

const getContextMenuItems = (intl, torrent) => {
  const clickHandler = handleItemClick;

  return [
    {
      action: 'start',
      clickHandler,
      label: intl.formatMessage({
        id: 'torrents.list.context.start',
      }),
    },
    {
      action: 'stop',
      clickHandler,
      label: intl.formatMessage({
        id: 'torrents.list.context.stop',
      }),
    },
    {
      action: 'remove',
      clickHandler,
      label: intl.formatMessage({
        id: 'torrents.list.context.remove',
      }),
    },
    {
      action: 'check-hash',
      clickHandler,
      label: intl.formatMessage({
        id: 'torrents.list.context.check.hash',
      }),
    },
    {
      type: 'separator',
    },
    {
      action: 'set-taxonomy',
      clickHandler,
      label: intl.formatMessage({
        id: 'torrents.list.context.set.tags',
      }),
    },
    {
      action: 'move',
      clickHandler,
      label: intl.formatMessage({
        id: 'torrents.list.context.move',
      }),
    },
    {
      action: 'set-tracker',
      clickHandler,
      label: intl.formatMessage({
        id: 'torrents.list.context.set.tracker',
      }),
    },
    {
      type: 'separator',
    },
    {
      action: 'torrent-details',
      clickHandler: (action, event) => {
        clickHandler(action, event, torrent);
      },
      label: intl.formatMessage({
        id: 'torrents.list.context.details',
      }),
    },
    {
      action: 'torrent-download-tar',
      clickHandler: (action, event) => {
        clickHandler(action, event, torrent);
      },
      label: intl.formatMessage({
        id: 'torrents.list.context.download',
      }),
    },
    {
      action: 'set-priority',
      clickHandler,
      dismissMenu: false,
      label: intl.formatMessage({
        id: 'torrents.list.context.priority',
      }),
      labelAction: (
        <PriorityMeter
          id={torrent.hash}
          key={torrent.hash}
          bindExternalChangeHandler={(priorityChangeHandler) => {
            handleTorrentPriorityChange = priorityChangeHandler;
          }}
          level={torrent.priority}
          maxLevel={3}
          priorityType="torrent"
          onChange={handleTorrentPriorityChange}
          showLabel={false}
        />
      ),
    },
  ];
};

export default {
  getContextMenuItems,
  handleDetailsClick,
};
