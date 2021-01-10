import {FC, useEffect} from 'react';
import {useIntl} from 'react-intl';

import DownloadRulesTab from './DownloadRulesTab';
import FeedActions from '../../../actions/FeedActions';
import FeedsTab from './FeedsTab';
import Modal from '../Modal';

const FeedsModal: FC = () => {
  const intl = useIntl();

  useEffect(() => {
    FeedActions.fetchFeedMonitors();
  }, []);

  const tabs = {
    feeds: {
      content: FeedsTab,
      label: intl.formatMessage({
        id: 'feeds.tabs.feeds',
      }),
    },
    downloadRules: {
      content: DownloadRulesTab,
      label: intl.formatMessage({
        id: 'feeds.tabs.download.rules',
      }),
    },
  };

  return (
    <Modal
      heading={intl.formatMessage({
        id: 'feeds.tabs.heading',
      })}
      orientation="horizontal"
      size="large"
      tabs={tabs}
    />
  );
};

export default FeedsModal;
