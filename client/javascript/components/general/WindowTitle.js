import {IntlProvider, injectIntl} from 'react-intl';
import DocumentTitle from 'react-document-title';
import React from 'react';
import ReactDOM from 'react-dom';

import * as i18n from '../../i18n/languages';
import EventTypes from '../../constants/EventTypes';
import Size from './Size';
import TransferDataStore from '../../stores/TransferDataStore';

const METHODS_TO_BIND = ['handleTransferChange'];


let Title = ({down, up}) => (
  <span>
    &darr; <Size value={down} isSpeed />{' '}
    &uarr; <Size value={up} isSpeed /> |{' '}
    Flood
  </span>
);

Title = injectIntl(Title);


class WindowTitle extends React.Component {
  constructor() {
    super();

    this.state = {
      title: 'Flood',
    };

    this.title = document.createElement('span');

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TransferDataStore.listen(
      EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE,
      this.handleTransferChange
    );
  }

  componentWillUnmount() {
    TransferDataStore.unlisten(
      EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE,
      this.handleTransferChange
    );
  }

  handleTransferChange() {
    const {children, intl} = this.props;

    const summary = TransferDataStore.getTransferSummary();

    ReactDOM.render((
      <IntlProvider locale={intl.locale} messages={i18n[intl.locale]}>
        <Title down={summary.downRate} up={summary.upRate} />
      </IntlProvider>
    ), this.title);

    this.setState({
      title: this.title.innerText,
    });

    ReactDOM.unmountComponentAtNode(this.title);
  }

  render() {
    const {children} = this.props;
    const {title} = this.state;

    return (
      <DocumentTitle title={title}>
        {children}
      </DocumentTitle>
    );
  }
}


export default injectIntl(WindowTitle);
