import {Router} from 'react-router-dom';
import {FormattedMessage, IntlProvider} from 'react-intl';
import {Route} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';

import * as i18n from './i18n/languages';
import connectStores, {EventListenerDescriptor} from './util/connectStores';
import AppWrapper from './components/AppWrapper';
import AuthActions from './actions/AuthActions';
import EventTypes from './constants/EventTypes';
import FloodActions from './actions/FloodActions';
import history from './util/history';
import Login from './components/views/Login';
import Register from './components/views/Register';
import SettingsStore from './stores/SettingsStore';
import TorrentClientOverview from './components/views/TorrentClientOverview';
import UIStore from './stores/UIStore';

import '../sass/style.scss';

const initialize = (): void => {
  UIStore.registerDependency({
    id: 'notifications',
    message: <FormattedMessage id="dependency.loading.notifications" defaultMessage="Notifications" />,
  });

  UIStore.registerDependency({
    id: 'torrent-taxonomy',
    message: <FormattedMessage id="dependency.loading.torrent.taxonomy" defaultMessage="Torrent Taxonomy" />,
  });

  UIStore.registerDependency([
    {
      id: 'transfer-data',
      message: (
        <FormattedMessage id="dependency.loading.transfer.rate.details" defaultMessage="Data Transfer Rate Details" />
      ),
    },
    {
      id: 'transfer-history',
      message: <FormattedMessage id="dependency.loading.transfer.history" defaultMessage="Data Transfer History" />,
    },
  ]);

  UIStore.registerDependency({
    id: 'torrent-list',
    message: <FormattedMessage id="dependency.loading.torrent.list" defaultMessage="Torrent List" />,
  });

  AuthActions.verify().then(
    ({initialUser}): void => {
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

  FloodActions.startActivityStream();
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

interface InjectedFloodAppProps {
  locale: keyof typeof i18n;
}

class FloodApp extends React.Component<InjectedFloodAppProps> {
  public componentDidMount(): void {
    initialize();
  }

  public render(): React.ReactNode {
    const {locale} = this.props;

    return (
      <IntlProvider locale={locale} messages={i18n[locale]}>
        {appRoutes}
      </IntlProvider>
    );
  }
}

const ConnectedFloodApp = connectStores<InjectedFloodAppProps>(
  FloodApp,
  (): EventListenerDescriptor<InjectedFloodAppProps>[] => {
    return [
      {
        store: SettingsStore,
        event: EventTypes.SETTINGS_CHANGE,
        getValue: (): InjectedFloodAppProps => {
          return {
            locale: SettingsStore.getFloodSettings('language'),
          };
        },
      },
    ];
  },
);

ReactDOM.render(<ConnectedFloodApp />, document.getElementById('app'));
