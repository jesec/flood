import {Router} from 'react-router-dom';
import {FormattedMessage, IntlProvider} from 'react-intl';
import {Route} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';

import detectLocale from './util/detectLocale';
import * as i18n from './i18n/languages';
import connectStores from './util/connectStores';
import AppWrapper from './components/AppWrapper';
import AuthActions from './actions/AuthActions';
import FloodActions from './actions/FloodActions';
import history from './util/history';
import Login from './components/views/Login';
import Register from './components/views/Register';
import SettingsStore from './stores/SettingsStore';
import TorrentClientOverview from './components/views/TorrentClientOverview';
import UIStore from './stores/UIStore';

import '../sass/style.scss';

interface FloodAppProps {
  locale?: keyof typeof i18n.languages;
}

const initialize = (): void => {
  UIStore.registerDependency({
    id: 'notifications',
    message: <FormattedMessage id="dependency.loading.notifications" />,
  });

  UIStore.registerDependency({
    id: 'torrent-taxonomy',
    message: <FormattedMessage id="dependency.loading.torrent.taxonomy" />,
  });

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

  UIStore.registerDependency({
    id: 'torrent-list',
    message: <FormattedMessage id="dependency.loading.torrent.list" />,
  });

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
    let {locale} = this.props;
    if (locale == null || locale === 'auto' || !Object.prototype.hasOwnProperty.call(i18n.languages, locale)) {
      locale = detectLocale();
    }

    return (
      <IntlProvider locale={locale} messages={i18n.languages[locale]}>
        {appRoutes}
      </IntlProvider>
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
