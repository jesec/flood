import {Router} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import {Route} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';

import AsyncIntlProvider from './i18n/languages';
import connectStores from './util/connectStores';
import AppWrapper from './components/AppWrapper';
import AuthActions from './actions/AuthActions';
import FloodActions from './actions/FloodActions';
import history from './util/history';
import Languages from './constants/Languages';
import LoadingIndicator from './components/general/LoadingIndicator';
import Login from './components/views/Login';
import Register from './components/views/Register';
import SettingsStore from './stores/SettingsStore';
import TorrentClientOverview from './components/views/TorrentClientOverview';
import UIStore from './stores/UIStore';

import '../sass/style.scss';

interface FloodAppProps {
  locale?: keyof typeof Languages;
}

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
        FloodActions.startActivityStream();
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
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/overview" component={TorrentClientOverview} />
    </AppWrapper>
  </Router>
);

class FloodApp extends React.Component<FloodAppProps> {
  public componentDidMount(): void {
    initialize();
  }

  public render(): React.ReactNode {
    return (
      <React.Suspense
        fallback={
          <div className="application__loading-overlay">
            <LoadingIndicator inverse />
          </div>
        }>
        <AsyncIntlProvider locale={this.props.locale}>{appRoutes}</AsyncIntlProvider>
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
