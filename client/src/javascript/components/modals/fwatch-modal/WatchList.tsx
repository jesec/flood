import {FC} from 'react';
import {observer} from 'mobx-react';
import {Trans} from '@lingui/react';

import {Close, Edit} from '@client/ui/icons';

import {WatchedDirectory} from '@shared/types/Watch';
import WatchStore from '@client/stores/WatchStore';

interface FeedListProps {
  currentWatch: WatchedDirectory | null;
  onSelect: (watcher: WatchedDirectory) => void;
  onRemove: (watcher: WatchedDirectory) => void;
}

const WatchList: FC<FeedListProps> = observer(
  ({currentWatch, onSelect, onRemove}: FeedListProps) => {
    const {watchedDirectories} = WatchStore;

    if (watchedDirectories.length === 0) {
      return (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <Trans id="watches.no.watches.defined" />
          </li>
        </ul>
      );
    }

    return (
      <ul className="interactive-list feed-list">
        {watchedDirectories.map((watcher) => {
          const matchedCount = watcher.count || 0;

          return (
            <li
              className="interactive-list__item interactive-list__item--stacked-content feed-list__feed"
              key={watcher._id}
            >
              <div className="interactive-list__label">
                <ul className="interactive-list__detail-list">
                  <li
                    className="interactive-list__detail-list__item
                interactive-list__detail--primary"
                  >
                    {watcher.label}
                  </li>
                  <li
                    className="interactive-list__detail-list__item
                interactive-list__detail-list__item--overflow
                interactive-list__detail interactive-list__detail--secondary"
                  >
                    <Trans id="feeds.match.count" values={{count: matchedCount}} />
                  </li>
                  {watcher === currentWatch && (
                    <li
                      className="interactive-list__detail-list__item
                interactive-list__detail--primary"
                    >
                      Modifying
                    </li>
                  )}
                </ul>
                <ul className="interactive-list__detail-list">
                  <li
                    className="interactive-list__detail-list__item
                interactive-list__detail-list__item--overflow
                interactive-list__detail interactive-list__detail--tertiary"
                  >
                    <a href={watcher.dir} rel="noopener noreferrer" target="_blank">
                      {watcher.dir}
                    </a>
                  </li>
                </ul>
              </div>
              <button
                className="interactive-list__icon interactive-list__icon--action"
                type="button"
                onClick={() => onSelect(watcher)}
              >
                <Edit />
              </button>
              <button
                className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
                type="button"
                onClick={() => onRemove(watcher)}
              >
                <Close />
              </button>
            </li>
          );
        })}
      </ul>
    );
  },
);

export default WatchList;
