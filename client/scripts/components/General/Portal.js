import {IntlProvider} from 'react-intl';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

import * as i18n from '../../i18n';
import SettingsStore from '../../stores/SettingsStore';

class Portal extends React.Component {
  componentDidMount() {
    this.nodeEl = document.createElement('div');
    document.body.appendChild(this.nodeEl);
    this.renderChildren(this.props);
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.nodeEl);
    document.body.removeChild(this.nodeEl);
  }

  componentWillReceiveProps(nextProps) {
    this.renderChildren(nextProps);
  }

  renderChildren(props) {
    if (props.children) {
      const locale = SettingsStore.getFloodSettings('language');

      ReactDOM.render((
        <IntlProvider locale={locale} messages={i18n[locale]}>
          {props.children}
        </IntlProvider>
      ), this.nodeEl);
    }
  }

  render() {
    return null;
  }
}

Portal.defaultProps = {
  children: <div />
};

Portal.propTypes = {
  children: PropTypes.node
};

export default Portal;
