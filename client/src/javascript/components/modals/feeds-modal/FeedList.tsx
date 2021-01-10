import {FC} from 'react';
import {observer} from 'mobx-react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {Feed} from '@shared/types/Feed';

import Close from '../../icons/Close';
import Edit from '../../icons/Edit';
import FeedStore from '../../../stores/FeedStore';

interface FeedListProps {
  currentFeed: Feed | null;
  intervalMultipliers: Readonly<Array<{message: string; value: number}>>;
  onSelect: (feed: Feed) => void;
  onRemove: (feed: Feed) => void;
}

const FeedList: FC<FeedListProps> = observer(
  ({currentFeed, intervalMultipliers, onSelect, onRemove}: FeedListProps) => {
    const {feeds} = FeedStore;
    const intl = useIntl();

    if (feeds.length === 0) {
      return (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <FormattedMessage id="feeds.no.feeds.defined" />
          </li>
        </ul>
      );
    }

    return (
      <ul className="interactive-list feed-list">
        {feeds.map((feed) => {
          const matchedCount = feed.count || 0;

          let intervalText = `${feed.interval}`;
          let intervalMultiplierMessage = intervalMultipliers[0].message;

          intervalMultipliers.forEach((interval) => {
            if (feed.interval % interval.value === 0) {
              intervalText = `${feed.interval / interval.value}`;
              intervalMultiplierMessage = interval.message;
            }
          });

          return (
            <li
              className="interactive-list__item interactive-list__item--stacked-content feed-list__feed"
              key={feed._id}>
              <div className="interactive-list__label">
                <ul className="interactive-list__detail-list">
                  <li
                    className="interactive-list__detail-list__item
                interactive-list__detail--primary">
                    {feed.label}
                  </li>
                  <li
                    className="interactive-list__detail-list__item
                interactive-list__detail-list__item--overflow
                interactive-list__detail interactive-list__detail--secondary">
                    <FormattedMessage id="feeds.match.count" values={{count: matchedCount}} />
                  </li>
                  {feed === currentFeed && (
                    <li
                      className="interactive-list__detail-list__item
                interactive-list__detail--primary">
                      Modifying
                    </li>
                  )}
                </ul>
                <ul className="interactive-list__detail-list">
                  <li
                    className="interactive-list__detail-list__item
                interactive-list__detail interactive-list__detail--tertiary">
                    {`${intervalText} ${intl.formatMessage({id: intervalMultiplierMessage})}`}
                  </li>
                  <li
                    className="interactive-list__detail-list__item
                interactive-list__detail-list__item--overflow
                interactive-list__detail interactive-list__detail--tertiary">
                    <a href={feed.url} rel="noopener noreferrer" target="_blank">
                      {feed.url}
                    </a>
                  </li>
                </ul>
              </div>
              <span
                className="interactive-list__icon interactive-list__icon--action"
                onClick={() => {
                  onSelect(feed);
                }}>
                <Edit />
              </span>
              <span
                className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
                onClick={() => {
                  onRemove(feed);
                }}>
                <Close />
              </span>
            </li>
          );
        })}
      </ul>
    );
  },
);

export default FeedList;
