import {IndexRoute, Router, Route, Link, browserHistory} from 'react-router';
import {IntlProvider} from 'react-intl';
import React from 'react';
import ReactDOM from 'react-dom';

import * as i18n from './i18n';
import Application from './components/Layout/Application';
import Login from './views/Login';
import Register from './views/Register';
import SettingsStore from './stores/SettingsStore';
import TorrentList from './views/TorrentList';

class FloodApp extends React.Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={Application}>
          <IndexRoute component={Login} />
          <Route path="login" component={Login} />
          <Route path="register" component={Register} />
          <Route path="list" component={TorrentList} />
          <Route path="*" component={Login} />
        </Route>
      </Router>
    );
  }
}

let locale = SettingsStore.getFloodSettings('language');

ReactDOM.render(
  <IntlProvider locale={locale} messages={i18n[locale]}>
    <FloodApp />
  </IntlProvider>,
  document.getElementById('app')
);
