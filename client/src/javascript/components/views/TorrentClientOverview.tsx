import {lazy, Component} from 'react';

import ActionBar from '../torrent-list/ActionBar';
import ApplicationContent from '../layout/ApplicationContent';
import ApplicationPanel from '../layout/ApplicationPanel';
import ApplicationView from '../layout/ApplicationView';
import FloodActions from '../../actions/FloodActions';
import Sidebar from '../sidebar/Sidebar';
import TorrentList from '../torrent-list/TorrentList';

import 'overlayscrollbars/css/OverlayScrollbars.css';

const Alerts = lazy(() => import('../alerts/Alerts'));
const Modals = lazy(() => import('../modals/Modals'));

export default class TorrentClientOverview extends Component {
  async componentDidMount() {
    FloodActions.startActivityStream();
  }

  render() {
    return (
      <ApplicationView>
        <Sidebar />
        <ApplicationContent>
          <ApplicationPanel modifier="torrent-list" className="view--torrent-list">
            <ActionBar />
            <TorrentList />
          </ApplicationPanel>
          <Modals />
          <Alerts />
        </ApplicationContent>
      </ApplicationView>
    );
  }
}
