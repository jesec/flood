import {observer} from 'mobx-react';
import {FC, lazy, Suspense, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {Route, Switch} from 'react-router';
import {Router} from 'react-router-dom';
import {useMedia} from 'react-use';
import {QueryParamProvider} from 'use-query-params';

import AuthActions from './actions/AuthActions';
import AppWrapper from './components/AppWrapper';
import LoadingOverlay from './components/general/LoadingOverlay';
import AsyncIntlProvider from './i18n/languages';
import ConfigStore from './stores/ConfigStore';
import SettingStore from './stores/SettingStore';
import UIStore from './stores/UIStore';
import history from './util/history';

import '../sass/style.scss';

const Login = lazy(() => import(/* webpackPrefetch: true */ './routes/Login'));
const Overview = lazy(() => import(/* webpackPreload: true */ './routes/Overview'));
const Register = lazy(() => import(/* webpackPrefetch: true */ './routes/Register'));

const FloodApp: FC = observer(() => {
  useEffect(() => {
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
  }, []);

  const isDarkTheme = useMedia('(prefers-color-scheme: dark)');
  useEffect(() => {
    ConfigStore.systemPreferDark = isDarkTheme;
  }, [isDarkTheme]);

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <AsyncIntlProvider language={SettingStore.floodSettings.language}>
        <Router history={history}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <AppWrapper className={ConfigStore.preferDark ? 'dark' : undefined}>
              <Switch>
                <Route path="/login" component={Login} />
                <Route path="/overview" component={Overview} />
                <Route path="/register" component={Register} />
              </Switch>
            </AppWrapper>
          </QueryParamProvider>
        </Router>
      </AsyncIntlProvider>
    </Suspense>
  );
});

ReactDOM.render(<FloodApp />, document.getElementById('app'));
