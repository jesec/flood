import {FC, useEffect} from 'react';
import {useLingui} from '@lingui/react';

import DownloadRulesTab from './DownloadRulesTab';
import FeedActions from '../../../actions/FeedActions';
import FeedsTab from './FeedsTab';
import Modal from '../Modal';

const FeedsModal: FC = () => {
  const {i18n} = useLingui();

  useEffect(() => {
    FeedActions.fetchFeedMonitors();
  }, []);

  const tabs = {
    feeds: {
      content: FeedsTab,
      label: i18n._('feeds.tabs.feeds'),
    },
    downloadRules: {
      content: DownloadRulesTab,
      label: i18n._('feeds.tabs.download.rules'),
    },
  };

  return <Modal heading={i18n._('feeds.tabs.heading')} orientation="horizontal" size="large" tabs={tabs} />;
};

export default FeedsModal;
