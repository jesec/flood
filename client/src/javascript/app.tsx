import {Router} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import {Route, Switch} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';

import AsyncIntlProvider from './i18n/languages';
import connectStores from './util/connectStores';
import AppWrapper from './components/AppWrapper';
import AuthActions from './actions/AuthActions';
import history from './util/history';
import LoadingIndicator from './components/general/LoadingIndicator';
import SettingsStore from './stores/SettingsStore';
import UIStore from './stores/UIStore';

import type {Language} from './constants/Languages';

import '../sass/style.scss';

const Login = React.lazy(() => import('./components/views/Login'));
const Register = React.lazy(() => import('./components/views/Register'));
const TorrentClientOverview = React.lazy(() => import('./components/views/TorrentClientOverview'));

interface FloodAppProps {
  locale?: Language;
}

const loadingOverlay = (
  <div className="application__loading-overlay">
    <LoadingIndicator inverse />
  </div>
);

const initialize = (): void => {
  UIStore.registerDependency([
    {
      id: 'notifications',
      message: <FormattedMessage id="dependency.loading.notifications" />,
    },
  ]);

  UIStore.registerDependency([
    {
      id: 'torrent-taxonomy',
      message: <FormattedMessage id="dependency.loading.torrent.taxonomy" />,
    },
  ]);

  UIStore.registerDependency([
    {
      id: 'transfer-data',
      message: <FormattedMessage id="dependency.loading.transfer.rate.details" />,
    },
    {
      id: 'transfer-history',
      message: <FormattedMessage id="dependency.loading.transfer.history" />,
    },
  ]);

  UIStore.registerDependency([
    {
      id: 'torrent-list',
      message: <FormattedMessage id="dependency.loading.torrent.list" />,
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

class FloodApp extends React.Component<FloodAppProps> {
  public componentDidMount(): void {
    initialize();
  }

  public render(): React.ReactNode {
    const {locale} = this.props;

    return (
      <React.Suspense fallback={loadingOverlay}>
        <AsyncIntlProvider locale={locale}>{appRoutes}</AsyncIntlProvider>
      </React.Suspense>
    );
  }
}

const ConnectedFloodApp = connectStores(FloodApp, () => {
  return [
    {
      store: SettingsStore,
      event: 'SETTINGS_CHANGE',
      getValue: () => {
        return {
          locale: SettingsStore.getFloodSetting('language'),
        };
      },
    },
  ];
});

ReactDOM.render(<ConnectedFloodApp />, document.getElementById('app'));
