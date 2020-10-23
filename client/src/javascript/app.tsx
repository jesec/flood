import {observer} from 'mobx-react';
import {Router} from 'react-router-dom';
import {Route, Switch} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';

import AsyncIntlProvider from './i18n/languages';
import AppWrapper from './components/AppWrapper';
import AuthActions from './actions/AuthActions';
import history from './util/history';
import LoadingOverlay from './components/general/LoadingOverlay';
import SettingStore from './stores/SettingStore';
import UIStore from './stores/UIStore';

import '../sass/style.scss';

const Login = React.lazy(() => import(/* webpackPrefetch: true */ './components/views/Login'));
const Register = React.lazy(() => import(/* webpackPrefetch: true */ './components/views/Register'));
const TorrentClientOverview = React.lazy(
  () => import(/* webpackPrefetch: true */ './components/views/TorrentClientOverview'),
);

const initialize = async (): Promise<void> => {
  UIStore.registerDependency([
    {
      id: 'notifications',
      message: {id: 'dependency.loading.notifications'},
    },
  ]);

  UIStore.registerDependency([
    {
      id: 'torrent-taxonomy',
      message: {id: 'dependency.loading.torrent.taxonomy'},
    },
  ]);

  UIStore.registerDependency([
    {
      id: 'transfer-data',
      message: {id: 'dependency.loading.transfer.rate.details'},
    },
    {
      id: 'transfer-history',
      message: {id: 'dependency.loading.transfer.history'},
    },
  ]);

  UIStore.registerDependency([
    {
      id: 'torrent-list',
      message: {id: 'dependency.loading.torrent.list'},
    },
  ]);

  AuthActions.verify().then(
    ({initialUser}: {initialUser?: boolean}): void => {
      if (initialUser) {
        history.replace('register');
      } else {
        history.replace('overview');
      }
    },
    (): void => {
      history.replace('login');
    },
  );
};

const appRoutes = (
  <Router history={history}>
    <AppWrapper>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/overview" component={TorrentClientOverview} />
      </Switch>
    </AppWrapper>
  </Router>
);

@observer
class FloodApp extends React.Component {
  componentDidMount(): void {
    initialize();
  }

  render(): React.ReactNode {
    return (
      <React.Suspense fallback={<LoadingOverlay />}>
        <AsyncIntlProvider locale={SettingStore.floodSettings.language}>{appRoutes}</AsyncIntlProvider>
      </React.Suspense>
    );
  }
}

ReactDOM.render(<FloodApp />, document.getElementById('app'));
