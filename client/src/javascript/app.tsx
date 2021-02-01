import {CastProvider} from 'react-cast-sender';
import {FC, lazy, Suspense, useEffect} from 'react';
import {observer} from 'mobx-react';
import {QueryParamProvider} from 'use-query-params';
import ReactDOM from 'react-dom';
import {Route, Switch} from 'react-router';
import {Router} from 'react-router-dom';
import {useMedia} from 'react-use';

import AuthActions from './actions/AuthActions';
import AppWrapper from './components/AppWrapper';
import LoadingOverlay from './components/general/LoadingOverlay';
import AsyncIntlProvider from './i18n/languages';
import ConfigStore from './stores/ConfigStore';
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

  const isSystemPreferDark = useMedia('(prefers-color-scheme: dark)');
  useEffect(() => {
    ConfigStore.setSystemPreferDark(isSystemPreferDark);
  }, [isSystemPreferDark]);

  // max-width here must sync with CSS
  const isSmallScreen = useMedia('(max-width: 720px)');
  useEffect(() => {
    ConfigStore.setSmallScreen(isSmallScreen);
  }, [isSmallScreen]);

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <AsyncIntlProvider>
        <CastProvider receiverApplicationId="CC1AD845">
          <Router history={history}>
            <QueryParamProvider ReactRouterRoute={Route}>
              <AppWrapper className={ConfigStore.isPreferDark ? 'dark' : undefined}>
                <Switch>
                  <Route path="/login" component={Login} />
                  <Route path="/overview" component={Overview} />
                  <Route path="/register" component={Register} />
                </Switch>
              </AppWrapper>
            </QueryParamProvider>
          </Router>
        </CastProvider>
      </AsyncIntlProvider>
    </Suspense>
  );
});

ReactDOM.render(<FloodApp />, document.getElementById('app'));
