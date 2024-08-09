import {FC, useEffect} from 'react';
import {useLingui} from '@lingui/react';

import WatchesTab from './WatchesTab';
import Modal from '../Modal';
import WatchActions from '@client/actions/WatchActions';

const WatchesModal: FC = () => {
  const {i18n} = useLingui();

  useEffect(() => {
    WatchActions.fetchWatchMonitors();
  }, []);

  const tabs = {
    watches: {
      content: WatchesTab,
      label: i18n._('watches.tabs.watches'),
    }
  };

  return <Modal heading={i18n._('watches.tabs.heading')} orientation="horizontal" size="large" tabs={tabs} />;
};

export default WatchesModal;
