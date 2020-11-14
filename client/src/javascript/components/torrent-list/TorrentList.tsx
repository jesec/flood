import {Component, createRef, FC, ReactNode} from 'react';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {observer} from 'mobx-react';
import {observable, reaction} from 'mobx';
import {useDropzone} from 'react-dropzone';

import type {FixedSizeList} from 'react-window';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import type {FloodSettings} from '@shared/types/FloodSettings';

import {Button} from '../../ui';
import ClientStatusStore from '../../stores/ClientStatusStore';
import ContextMenuMountPoint from '../general/ContextMenuMountPoint';
import Files from '../icons/Files';
import ListViewport from '../general/ListViewport';
import SettingActions from '../../actions/SettingActions';
import SettingStore from '../../stores/SettingStore';
import TableHeading from './TableHeading';
import TorrentActions from '../../actions/TorrentActions';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentListRow from './TorrentListRow';
import TorrentStore from '../../stores/TorrentStore';

import type {TorrentListColumn} from '../../constants/TorrentListColumns';

const TorrentDropzone: FC<{children: ReactNode}> = ({children}: {children: ReactNode}) => {
  const handleFileDrop = (files: Array<File>) => {
    const filesData: Array<string> = [];

    const callback = (data: string) => {
      filesData.push(data);

      if (filesData.length === files.length && filesData[0] != null) {
        TorrentActions.addTorrentsByFiles({
          files: filesData as [string, ...string[]],
          destination:
            SettingStore.floodSettings.torrentDestination || SettingStore.clientSettings?.directoryDefault || '',
          isBasePath: false,
          start: SettingStore.floodSettings.startTorrentsOnLoad,
        });
      }
    };

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result != null && typeof e.target.result === 'string') {
          callback(e.target.result.split('base64,')[1]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const {getRootProps, isDragActive} = useDropzone({onDrop: handleFileDrop, noClick: true, noKeyboard: true});

  return (
    <div
      {...getRootProps({onClick: (evt) => evt.preventDefault()})}
      className={`dropzone dropzone--with-overlay torrents ${isDragActive ? 'dropzone--is-dragging' : ''}`}>
      {children}
    </div>
  );
};

const getEmptyTorrentListNotification = (): ReactNode => {
  let clearFilters = null;

  if (TorrentFilterStore.isFilterActive) {
    clearFilters = (
      <div className="torrents__alert__action">
        <Button
          onClick={() => {
            TorrentFilterStore.clearAllFilters();
          }}
          priority="tertiary">
          <FormattedMessage id="torrents.list.clear.filters" />
        </Button>
      </div>
    );
  }

  return (
    <div className="torrents__alert__wrapper">
      <div className="torrents__alert">
        <FormattedMessage id="torrents.list.no.torrents" />
      </div>
      {clearFilters}
    </div>
  );
};

@observer
class TorrentList extends Component<WrappedComponentProps> {
  listHeaderRef = createRef<HTMLDivElement>();
  listViewportRef = createRef<FixedSizeList>();

  torrentListViewportSize = observable.object<{width: number; height: number}>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  constructor(props: WrappedComponentProps) {
    super(props);

    reaction(() => TorrentFilterStore.filters, this.handleTorrentFilterChange);
  }

  handleColumnWidthChange = (column: TorrentListColumn, width: number) => {
    const {torrentListColumnWidths = defaultFloodSettings.torrentListColumnWidths} = SettingStore.floodSettings;

    SettingActions.saveSetting('torrentListColumnWidths', {
      ...torrentListColumnWidths,
      [column]: width,
    });
  };

  handleTorrentFilterChange = () => {
    if (this.listViewportRef.current != null) {
      this.listViewportRef.current.scrollTo(0);
    }
  };

  handleViewportScroll = (scrollLeft: number) => {
    if (this.listHeaderRef.current != null) {
      this.listHeaderRef.current.scrollLeft = scrollLeft;
    }
  };

  render() {
    const torrents = TorrentStore.filteredTorrents;
    const {torrentListViewSize = 'condensed'} = SettingStore.floodSettings;

    const isCondensed = torrentListViewSize === 'condensed';
    const isListEmpty = torrents == null || torrents.length === 0;

    let content: ReactNode = null;
    let torrentListHeading: ReactNode = null;
    if (!ClientStatusStore.isConnected) {
      content = (
        <div className="torrents__alert__wrapper">
          <div className="torrents__alert">
            <FormattedMessage id="torrents.list.cannot.connect" />
          </div>
        </div>
      );
    } else if (isListEmpty || torrents == null) {
      content = getEmptyTorrentListNotification();
    } else {
      if (isCondensed) {
        torrentListHeading = (
          <TableHeading
            onCellClick={(property: TorrentListColumn) => {
              const currentSort = SettingStore.floodSettings.sortTorrents;

              let nextDirection: FloodSettings['sortTorrents']['direction'] = 'asc';

              if (currentSort.property === property) {
                nextDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
              }

              const sortBy = {
                property,
                direction: nextDirection,
              };

              SettingActions.saveSetting('sortTorrents', sortBy);
            }}
            onWidthsChange={this.handleColumnWidthChange}
            ref={this.listHeaderRef}
          />
        );
      }

      // itemSize must sync with styles &--is-condensed and &--is-expanded
      content = (
        <ListViewport
          className="torrent__list__viewport"
          itemRenderer={({index, style}) => {
            const {hash} = TorrentStore.filteredTorrents[index];

            return <TorrentListRow key={hash} style={style} hash={hash} />;
          }}
          itemSize={isCondensed ? 30 : 70}
          listLength={torrents.length}
          ref={this.listViewportRef}
          outerRef={(ref) => {
            const viewportDiv = ref;
            if (viewportDiv != null && viewportDiv.onscroll == null) {
              viewportDiv.onscroll = () => {
                this.handleViewportScroll(viewportDiv.scrollLeft);
              };
            }
          }}
        />
      );
    }

    return (
      <TorrentDropzone>
        <div className="torrent__list__wrapper">
          <ContextMenuMountPoint id="torrent-list-item" />
          {torrentListHeading}
          {content}
        </div>
        <div className="dropzone__overlay">
          <div className="dropzone__copy">
            <div className="dropzone__icon">
              <Files />
            </div>
            <FormattedMessage id="torrents.list.drop" />
          </div>
        </div>
      </TorrentDropzone>
    );
  }
}

export default injectIntl(TorrentList);
