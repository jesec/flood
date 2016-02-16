import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';

import AddTorrentsByFile from './AddTorrentsByFile';
import AddTorrentsByURL from './AddTorrentsByURL';
import EventTypes from '../../constants/EventTypes';
import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import Modal from './Modal';
import TextboxRepeater from '../forms/TextboxRepeater';
import TorrentActions from '../../actions/TorrentActions';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = ['onAddTorrentSuccess'];

export default class AddTorrents extends React.Component {
  constructor() {
    super();

    this.state = {
      addTorrentsError: null,
      destination: null,
      isExpanded: false,
      isAddingTorrents: false,
      urlTextboxes: [{value: null}]
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_ADD_TORRENT_SUCCESS, this.onAddTorrentSuccess);
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_ADD_TORRENT_SUCCESS, this.onAddTorrentSuccess);
  }

  dismissModal() {
    this.props.dismiss();
  }

  onAddTorrentError() {
    this.setState({
      addTorrentsError: 'There was an error, but I have no idea what happened!',
      isAddingTorrents: false
    });
  }

  onAddTorrentSuccess() {
    this.dismissModal();
  }

  getAddByFileContent() {
    return <span>add by file</span>;
  }

  render() {
    let tabs = {
      'by-url': {
        content: <AddTorrentsByURL />,
        label: 'By URL'
      },
      // 'by-file': {
      //   content: <AddTorrentsByFile />,
      //   label: 'By File'
      // }
    };

    return (
      <Modal heading="Add Torrents"
        dismiss={this.dismissModal}
        tabs={tabs} />
    );
  }
}
