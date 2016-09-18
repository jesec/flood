import {FormattedMessage, IntlProvider} from 'react-intl';
import {IndexRoute, Router, Route, Link, browserHistory} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';

import * as i18n from './i18n';
import Application from './components/Layout/Application';
import EventTypes from './constants/EventTypes';
import Login from './views/Login';
import Register from './views/Register';
import SettingsStore from './stores/SettingsStore';
import TorrentList from './views/TorrentList';
import UIStore from './stores/UIStore';

let appRoutes = (
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
  }

  componentWillMount() {
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
