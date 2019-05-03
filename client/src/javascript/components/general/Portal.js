import {IntlProvider} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import * as i18n from '../../i18n/languages';
import SettingsStore from '../../stores/SettingsStore';

class Portal extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: <div />,
  };

  componentDidMount() {
    this.nodeEl = document.createElement('div');
    document.body.appendChild(this.nodeEl);
    this.renderChildren(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.renderChildren(nextProps);
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.nodeEl);
    document.body.removeChild(this.nodeEl);
  }

  renderChildren(props) {
    if (props.children) {
      const locale = SettingsStore.getFloodSettings('language');

      ReactDOM.render(
        // eslint-disable-next-line import/namespace
        <IntlProvider locale={locale} messages={i18n[locale]}>
          {props.children}
        </IntlProvider>,
        this.nodeEl,
      );
    }
  }

  render() {
    return null;
  }
}

export default Portal;
