import {injectIntl} from 'react-intl';
import React from 'react';

import connectStores from '../../util/connectStores';
import {compute, getTranslationString} from '../../util/size';
import EventTypes from '../../constants/EventTypes';
import TransferDataStore from '../../stores/TransferDataStore';

const WindowTitle = props => {
  const {intl, summary} = props;

  React.useEffect(
    () => {
      let title = 'Flood';

      if (Object.keys(summary).length > 0) {
        const down = compute(summary.downRate);
        const up = compute(summary.upRate);

        const formattedDownSpeed = intl.formatNumber(down.value);
        const formattedUpSpeed = intl.formatNumber(up.value);

        const translatedDownUnit = intl.formatMessage(
          {
            id: 'unit.speed',
            defaultMessage: '{baseUnit}/s',
          },
          {
            baseUnit: intl.formatMessage({id: getTranslationString(down.unit)}),
          },
        );
        const translatedUpUnit = intl.formatMessage(
          {
            id: 'unit.speed',
            defaultMessage: '{baseUnit}/s',
          },
          {
            baseUnit: intl.formatMessage({id: getTranslationString(up.unit)}),
          },
        );

        title = intl.formatMessage(
          {
            id: 'window.title',
            // \u2193 and \u2191 are down and up arrows, respectively
            defaultMessage: '\u2193 {down} \u2191 {up} - Flood',
          },
          {
            down: `${formattedDownSpeed} ${translatedDownUnit}`,
            up: `${formattedUpSpeed} ${translatedUpUnit}`,
          },
        );
      }

      console.log('setting title', title);
      document.title = title;
    },
    [intl, summary],
  );

  return null;
};

const ConnectedWindowTitle = connectStores(injectIntl(WindowTitle), () => {
  return [
    {
      store: TransferDataStore,
      event: EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE,
      getValue: ({store}) => {
        return {
          summary: store.getTransferSummary(),
        };
      },
    },
  ];
});

export default ConnectedWindowTitle;
