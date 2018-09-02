import {IntlProvider} from 'react-intl';
import {IndexRoute, Router, Route, browserHistory} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';

import * as i18n from './i18n/languages';
import AppWrapper from './components/AppWrapper';
import EventTypes from './constants/EventTypes';
import FloodActions from './actions/FloodActions';
import Login from './components/views/Login';
import Register from './components/views/Register';
import SettingsStore from './stores/SettingsStore';
import TorrentClientOverview from './components/views/TorrentClientOverview';

import '../sass/style.scss';

const appRoutes = (
  <Router history={browserHistory}>
    <Route path="/" component={AppWrapper}>
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

    FloodActions.startActivityStream();
  }

  componentDidMount() {
    SettingsStore.listen(
      EventTypes.SETTINGS_CHANGE,
      this.handleSettingsChange
    ); 

    SettingsStore.fetchClientSettings();
    SettingsStore.fetchFloodSettings();
  }

  componentWillUnmount() {
    SettingsStore.unlisten(
      EventTypes.SETTINGS_CHANGE,
      this.handleSettingsChange
    );
  }

  handleSettingsChange() {
    const nextLocale = SettingsStore.getFloodSettings('language');
    if (nextLocale !== this.state.language) {
      this.setState({locale: nextLocale});
    }
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
