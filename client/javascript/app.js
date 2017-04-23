import {FormattedMessage, IntlProvider} from 'react-intl';
import {IndexRoute, Router, Route, Link, browserHistory} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';

import * as i18n from './i18n/languages';
import AuthEnforcer from './components/auth/AuthEnforcer';
import EventTypes from './constants/EventTypes';
import Login from './components/views/Login';
import Register from './components/views/Register';
import SettingsStore from './stores/SettingsStore';
import TorrentClientOverview from './components/views/TorrentClientOverview';
import UIStore from './stores/UIStore';

let appRoutes = (
  <Router history={browserHistory}>
    <Route path="/" component={AuthEnforcer}>
      <IndexRoute component={Login} />
      <Route path="login" component={Login} />
      <Route path="register" component={Register} />
      <Route path="overview" component={TorrentClientOverview} />
      <Route path="*" component={Login} />
    </Route>
  </Router>
);

const METHODS_TO_BIND = ['handleSettingsChange'];

class FloodApp extends React.Component {
  constructor() {
    super();

    this.state = {
      locale: SettingsStore.getFloodSettings('language')
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    UIStore.registerDependency({
      id: 'flood-settings',
      message: (
        <FormattedMessage id="dependency.loading.flood.settings"
          defaultMessage="Flood Settings" />
      )
    });
  }

  componentDidMount() {
    SettingsStore.listen(EventTypes.SETTINGS_CHANGE,
      this.handleSettingsChange);
  }

  componentWillUnmount() {
    SettingsStore.unlisten(EventTypes.SETTINGS_CHANGE,
      this.handleSettingsChange);
  }

  handleSettingsChange() {
    if (SettingsStore.getFloodSettings('language') !== this.state.language) {
      this.setState({locale: SettingsStore.getFloodSettings('language')});
    }

    UIStore.satisfyDependency('flood-settings');
  }

  render() {
    let {locale} = this.state;

    return (
      <IntlProvider locale={locale} messages={i18n[locale]}>
        {appRoutes}
      </IntlProvider>
    );
  }
}

ReactDOM.render(<FloodApp />, document.getElementById('app'));
