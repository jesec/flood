import {BrowserRouter} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import {FC, lazy, Suspense, useEffect} from 'react';
import {observer} from 'mobx-react';
import {Route, Routes} from 'react-router';
import {useMedia} from 'react-use';

import AppWrapper from './components/AppWrapper';
import LoadingOverlay from './components/general/LoadingOverlay';
import AsyncIntlProvider from './i18n/languages';
import ConfigStore from './stores/ConfigStore';
import UIStore from './stores/UIStore';

import stringUtil from '@shared/util/stringUtil';

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
        <BrowserRouter basename={stringUtil.withoutTrailingSlash(ConfigStore.baseURI)}>
          <AppWrapper className={ConfigStore.isPreferDark ? 'dark' : undefined}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </AppWrapper>
        </BrowserRouter>
      </AsyncIntlProvider>
    </Suspense>
  );
});

const container = document.getElementById('app') as HTMLElement;
const root = createRoot(container);

root.render(<FloodApp />);
