import {useIntl} from 'react-intl';
import React from 'react';

import type {TransferSummary} from '@shared/types/TransferData';

import connectStores from '../../util/connectStores';
import {compute, getTranslationString} from '../../util/size';
import TransferDataStore from '../../stores/TransferDataStore';

interface WindowTitleProps {
  summary?: TransferSummary;
}

const WindowTitleFunc: React.FC<WindowTitleProps> = (props: WindowTitleProps) => {
  const {summary} = props;
  const intl = useIntl();

  React.useEffect(() => {
    let title = 'Flood';

    if (summary != null && Object.keys(summary).length > 0) {
      const down = compute(summary.downRate);
      const up = compute(summary.upRate);

      const formattedDownSpeed = intl.formatNumber(down.value);
      const formattedUpSpeed = intl.formatNumber(up.value);

      const translatedDownUnit = intl.formatMessage(
        {
          id: 'unit.speed',
        },
        {
          baseUnit: intl.formatMessage({id: getTranslationString(down.unit)}),
        },
      );
      const translatedUpUnit = intl.formatMessage(
        {
          id: 'unit.speed',
        },
        {
          baseUnit: intl.formatMessage({id: getTranslationString(up.unit)}),
        },
      );

      title = intl.formatMessage(
        {
          id: 'window.title',
          // \u2193 and \u2191 are down and up arrows, respectively
        },
        {
          down: `${formattedDownSpeed} ${translatedDownUnit}`,
          up: `${formattedUpSpeed} ${translatedUpUnit}`,
        },
      );
    }

    document.title = title;
  }, [intl, summary]);

  return null;
};

const WindowTitle = connectStores(WindowTitleFunc, () => {
  return [
    {
      store: TransferDataStore,
      event: 'CLIENT_TRANSFER_SUMMARY_CHANGE',
      getValue: ({store}) => {
        const storeTransferData = store as typeof TransferDataStore;
        return {
          summary: storeTransferData.getTransferSummary(),
        };
      },
    },
  ];
});

export default WindowTitle;
