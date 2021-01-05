import {FC} from 'react';
import {FormattedMessage} from 'react-intl';
import {observer} from 'mobx-react';

import {Rule} from '@shared/types/Feed';

import Close from '../../icons/Close';
import Edit from '../../icons/Edit';
import FeedStore from '../../../stores/FeedStore';

interface DownloadRuleListProps {
  currentRule: Rule | null;
  onSelect: (rule: Rule) => void;
  onRemove: (rule: Rule) => void;
}

const DownloadRuleList: FC<DownloadRuleListProps> = observer(
  ({currentRule, onSelect, onRemove}: DownloadRuleListProps) => {
    const {rules} = FeedStore;

    if (rules.length === 0) {
      return (
        <ul className="interactive-list">
          <li className="interactive-list__item">
            <FormattedMessage id="feeds.no.rules.defined" />
          </li>
        </ul>
      );
    }

    return (
      <ul className="interactive-list">
        {rules.map((rule) => {
          const matchedCount = rule.count || 0;
          let excludeNode = null;
          let tags = null;

          if (rule.exclude) {
            excludeNode = (
              <li
                className="interactive-list__detail-list__item
        interactive-list__detail interactive-list__detail--tertiary">
                <FormattedMessage id="feeds.exclude" />
                {': '}
                {rule.exclude}
              </li>
            );
          }

          if (rule.tags && rule.tags.length > 0) {
            const tagNodes = rule.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ));

            tags = (
              <li className="interactive-list__detail-list__item interactive-list__detail interactive-list__detail--tertiary">
                <FormattedMessage id="feeds.tags" />
                {': '}
                {tagNodes}
              </li>
            );
          }

          return (
            <li className="interactive-list__item interactive-list__item--stacked-content" key={rule._id}>
              <div className="interactive-list__label">
                <ul className="interactive-list__detail-list">
                  <li
                    className="interactive-list__detail-list__item
            interactive-list__detail--primary">
                    {rule.label}
                  </li>
                  <li
                    className="interactive-list__detail-list__item
            interactive-list__detail-list__item--overflow
            interactive-list__detail interactive-list__detail--secondary">
                    <FormattedMessage id="feeds.match.count" values={{count: matchedCount}} />
                  </li>
                  {rule === currentRule && (
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
            interactive-list__detail interactive-list__detail--tertiary"
                    style={{
                      maxWidth: '50%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                    <FormattedMessage id="feeds.match" />
                    {': '}
                    {rule.match}
                  </li>
                  <div style={{width: '100%'}} />
                  {excludeNode}
                  {tags}
                </ul>
              </div>
              <span className="interactive-list__icon interactive-list__icon--action" onClick={() => onSelect(rule)}>
                <Edit />
              </span>
              <span
                className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
                onClick={() => onRemove(rule)}>
                <Close />
              </span>
            </li>
          );
        })}
      </ul>
    );
  },
);

export default DownloadRuleList;
