import {injectIntl} from 'react-intl';
import DocumentTitle from 'react-document-title';
import React from 'react';

import {compute, getTranslationString} from '../../util/size';
import EventTypes from '../../constants/EventTypes';
import TransferDataStore from '../../stores/TransferDataStore';

const METHODS_TO_BIND = ['handleTransferChange'];

class WindowTitle extends React.Component {
  constructor() {
    super();

    this.state = {
      title: 'Flood',
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TransferDataStore.listen(EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE, this.handleTransferChange);
  }

  componentWillUnmount() {
    TransferDataStore.unlisten(EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE, this.handleTransferChange);
  }

  handleTransferChange() {
    const {intl} = this.props;

    const summary = TransferDataStore.getTransferSummary();

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

    const formattedTitle = intl.formatMessage(
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

    this.setState({
      title: formattedTitle,
    });
  }

  render() {
    const {children} = this.props;
    const {title} = this.state;

    return <DocumentTitle title={title}>{children}</DocumentTitle>;
  }
}

export default injectIntl(WindowTitle);
