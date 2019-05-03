import React from 'react';

import SortableList from '../../general/SortableList';

class UITabSortableDetailColumns extends React.PureComponent {
  getLockedIDs() {
    if (this.props.torrentListViewSize === 'expanded') {
      return ['name', 'eta', 'downloadRate', 'uploadRate'];
    }

    return [];
  }

  render() {
    const lockedIDs = this.getLockedIDs();
    let torrentDetailItems = this.props.torrentDetails.slice();

    if (this.props.torrentListViewSize === 'expanded') {
      let nextUnlockedIndex = lockedIDs.length;

      torrentDetailItems = torrentDetailItems.reduce((accumulator, detail) => {
        const lockedIDIndex = lockedIDs.indexOf(detail.id);

        if (lockedIDIndex > -1) {
          accumulator[lockedIDIndex] = detail;
        } else {
          accumulator[nextUnlockedIndex++] = detail;
        }

        return accumulator;
      }, []);
    }

    return (
      <SortableList
        className="sortable-list--torrent-details"
        items={torrentDetailItems}
        lockedIDs={lockedIDs}
        onMouseDown={this.handleTorrentDetailsMouseDown}
        onDrop={this.handleTorrentDetailsMove}
        renderItem={this.renderTorrentDetailItem}
      />
    );
  }
}

export default UITabSortableDetailColumns;
