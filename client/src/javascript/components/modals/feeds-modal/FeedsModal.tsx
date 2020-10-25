import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import DownloadRulesTab from './DownloadRulesTab';
import FeedActions from '../../../actions/FeedActions';
import FeedStore from '../../../stores/FeedStore';
import FeedsTab from './FeedsTab';
import Modal from '../Modal';

class FeedsModal extends React.Component<WrappedComponentProps> {
  componentDidMount() {
    FeedActions.fetchFeedMonitors();
  }

  render() {
    const tabs = {
      feeds: {
        content: FeedsTab,
        props: {
          feedStore: FeedStore,
        },
        label: this.props.intl.formatMessage({
          id: 'feeds.tabs.feeds',
        }),
      },
      downloadRules: {
        content: DownloadRulesTab,
        props: {
          feedStore: FeedStore,
        },
        label: this.props.intl.formatMessage({
          id: 'feeds.tabs.download.rules',
        }),
      },
    };

    return (
      <Modal
        heading={this.props.intl.formatMessage({
          id: 'feeds.tabs.heading',
        })}
        orientation="horizontal"
        size="large"
        tabs={tabs}
      />
    );
  }
}

export default injectIntl(FeedsModal);
