import {createRef, FC, MutableRefObject} from 'react';
import {observer} from 'mobx-react';

import type {TorrentProperties} from '@shared/types/Torrent';

import Checkmark from '../../ui/icons/Checkmark';
import ConfigStore from '../../stores/ConfigStore';
import PriorityMeter from '../general/PriorityMeter';
import TorrentActions from '../../actions/TorrentActions';
import TorrentContextMenuActions from '../../constants/TorrentContextMenuActions';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

import type {ContextMenuItem} from '../../stores/UIStore';

const getLastSelectedTorrent = (): string => TorrentStore.selectedTorrents[TorrentStore.selectedTorrents.length - 1];

const InlineTorrentPropertyCheckbox: FC<{property: keyof TorrentProperties}> = observer(
  ({property}: {property: keyof TorrentProperties}) => (
    <label className="toggle-input checkbox" style={{display: 'inline'}}>
      <div className="toggle-input__indicator">
        <div
          className="toggle-input__indicator__icon"
          style={{
            opacity: TorrentStore.torrents[getLastSelectedTorrent()][property] ? '1' : undefined,
          }}>
          <Checkmark />
        </div>
      </div>
    </label>
  ),
);

const getContextMenuItems = (torrent: TorrentProperties): Array<ContextMenuItem> => {
  const changePriorityFuncRef = createRef<() => number>();

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
        UIActions.displayModal({
          id: 'torrent-details',
          hash: getLastSelectedTorrent(),
        });
      },
    },
    {
      type: 'action',
      action: 'downloadContents',
      label: TorrentContextMenuActions.downloadContents.id,
      clickHandler: (e) => {
        e.preventDefault();

        const link = document.createElement('a');

        link.download = '';
        link.href = `${ConfigStore.baseURI}api/torrents/${getLastSelectedTorrent()}/contents/all/data`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
    {
      type: 'action',
      action: 'downloadMetainfo',
      label: TorrentContextMenuActions.downloadMetainfo.id,
      clickHandler: (e) => {
        e.preventDefault();

        const link = document.createElement('a');

        link.download = '';
        link.href = `${ConfigStore.baseURI}api/torrents/${TorrentStore.selectedTorrents.join(',')}/metainfo`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
    {
      type: 'action',
      action: 'generateMagnet',
      label: TorrentContextMenuActions.generateMagnet.id,
      clickHandler: () => {
        UIActions.displayModal({id: 'generate-magnet'});
      },
    },
    {
      type: 'action',
      action: 'setInitialSeeding',
      label: TorrentContextMenuActions.setInitialSeeding.id,
      clickHandler: () => {
        const {selectedTorrents} = TorrentStore;
        TorrentActions.setInitialSeeding({
          hashes: selectedTorrents,
          isInitialSeeding: !TorrentStore.torrents[getLastSelectedTorrent()].isInitialSeeding,
        });
      },
      dismissMenu: false,
      labelAction: () => <InlineTorrentPropertyCheckbox property="isInitialSeeding" />,
    },
    {
      type: 'action',
      action: 'setSequential',
      label: TorrentContextMenuActions.setSequential.id,
      clickHandler: () => {
        const {selectedTorrents} = TorrentStore;
        TorrentActions.setSequential({
          hashes: selectedTorrents,
          isSequential: !TorrentStore.torrents[getLastSelectedTorrent()].isSequential,
        });
      },
      dismissMenu: false,
      labelAction: () => <InlineTorrentPropertyCheckbox property="isSequential" />,
    },
    {
      type: 'action',
      action: 'setPriority',
      label: TorrentContextMenuActions.setPriority.id,
      clickHandler: () => {
        if (changePriorityFuncRef.current != null) {
          TorrentActions.setPriority({
            hashes: TorrentStore.selectedTorrents,
            priority: changePriorityFuncRef.current(),
          });
        }
      },
      dismissMenu: false,
      labelAction: () => (
        <PriorityMeter
          id={torrent.hash}
          key={torrent.hash}
          level={torrent.priority}
          maxLevel={3}
          onChange={() => undefined}
          priorityType="torrent"
          showLabel={false}
          changePriorityFuncRef={changePriorityFuncRef as MutableRefObject<() => number>}
          clickHandled
        />
      ),
    },
  ];
};

export default {
  getContextMenuItems,
};
