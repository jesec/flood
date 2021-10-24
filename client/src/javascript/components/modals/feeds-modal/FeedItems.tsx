import {FC, ReactElement} from 'react';
import {observer} from 'mobx-react';
import {Trans} from '@lingui/react';

import {Checkbox, FormRow} from '@client/ui';

import FeedStore from '@client/stores/FeedStore';

interface FeedItemsProps {
  selectedFeedID: string;
}

const FeedItems: FC<FeedItemsProps> = observer(({selectedFeedID}: FeedItemsProps) => {
  const {items} = FeedStore;

  const itemElements: Array<ReactElement> = [];
  if (selectedFeedID) {
    const titleOccurrences: Record<string, number> = {};
    items.forEach((item, index) => {
      let {title} = item;
      const occurrence = titleOccurrences[title];

      if (occurrence == null) {
        titleOccurrences[title] = 2;
      } else {
        title = `${title} #${occurrence}`;
        titleOccurrences[title] += 1;
      }

      itemElements.push(
        <li className="interactive-list__item interactive-list__item--stacked-content feed-list__feed" key={title}>
          <div className="interactive-list__label feed-list__feed-label">{title}</div>
          <Checkbox id={`${index}`} />
        </li>,
      );
    });
  }

  return (
    <FormRow>
      {itemElements.length === 0 ? (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <div className="interactive-list__label">
              <Trans id="feeds.no.items.matching" />
            </div>
          </li>
        </ul>
      ) : (
        <ul className="interactive-list feed-list">{itemElements}</ul>
      )}
    </FormRow>
  );
});

export default FeedItems;
