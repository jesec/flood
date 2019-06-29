import {injectIntl} from 'react-intl';
import DocumentTitle from 'react-document-title';
import React from 'react';

import connectStores from '../../util/connectStores';
import {compute, getTranslationString} from '../../util/size';
import EventTypes from '../../constants/EventTypes';
import TransferDataStore from '../../stores/TransferDataStore';

class WindowTitle extends React.Component {
  renderTitle() {
    const {intl, summary} = this.props;

    if (Object.keys(summary).length === 0) {
      return 'Flood';
    }

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

    return intl.formatMessage(
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

  render() {
    const {children} = this.props;
    return <DocumentTitle title={this.renderTitle()}>{children}</DocumentTitle>;
  }
}

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
