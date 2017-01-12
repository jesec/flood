import {defineMessages, formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import _ from 'lodash';
import classNames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';
import ReactDOM from 'react-dom';

import ContextMenu from '../General/ContextMenu';
import CustomScrollbars from '../General/CustomScrollbars';
import EventTypes from '../../constants/EventTypes';
import ListViewport from '../General/ListViewport';
import LoadingIndicator from '../General/LoadingIndicator';
import PriorityLevels from '../../constants/PriorityLevels';
import PriorityMeter from '../General/Filesystem/PriorityMeter';
import Torrent from './Torrent';
import TorrentActions from '../../actions/TorrentActions';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const MESSAGES = defineMessages({
  torrentListDependency: {
    id: 'dependency.loading.torrent.list',
    defaultMessage: 'Torrent List'
  }
});

const METHODS_TO_BIND = [
  'bindExternalPriorityChangeHandler',
  'handleContextMenuItemClick',
  'handleDetailsClick',
  'handleRightClick',
  'handleTorrentClick',
  'onContextMenuChange',
  'onReceiveTorrentsError',
  'onReceiveTorrentsSuccess',
  'onTorrentFilterChange',
  'onTorrentSelectionChange',
  'renderListItem'
];

class TorrentListContainer extends React.Component {
  constructor(props) {
    super();

    this.state = {
      emptyTorrentList: false,
      handleTorrentPriorityChange: null,
      contextMenu: null,
      torrentCount: 0,
      torrentHeight: null,
      torrents: [],
      torrentRequestError: false,
      torrentRequestSuccess: false,
      viewportHeight: 0
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    UIStore.registerDependency({
      id: 'torrent-list',
      message: props.intl.formatMessage(MESSAGES.torrentListDependency)
    });
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.onTorrentSelectionChange);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onReceiveTorrentsSuccess);
    TorrentStore.listen(EventTypes.UI_TORRENTS_LIST_FILTERED, this.onReceiveTorrentsSuccess);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_ERROR, this.onReceiveTorrentsError);
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_CHANGE, this.onTorrentFilterChange);
    UIStore.listen(EventTypes.UI_CONTEXT_MENU_CHANGE, this.onContextMenuChange);
    // window.addEventListener('resize', this.handleWindowResize);
    TorrentStore.fetchTorrents();
    // this.setViewportHeight();
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.onTorrentSelectionChange);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onReceiveTorrentsSuccess);
    TorrentStore.unlisten(EventTypes.UI_TORRENTS_LIST_FILTERED, this.onReceiveTorrentsSuccess);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_ERROR, this.onReceiveTorrentsError);
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_CHANGE, this.onTorrentFilterChange);
    UIStore.unlisten(EventTypes.UI_CONTEXT_MENU_CHANGE, this.onContextMenuChange);
    // window.removeEventListener('resize', this.handleWindowResize);
  }

  bindExternalPriorityChangeHandler(eventHandler) {
    this.setState({handleTorrentPriorityChange: eventHandler});
  }

  getContextMenuItems(torrent) {
    let clickHandler = this.handleContextMenuItemClick;

    return [{
      action: 'start',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.start',
        defaultMessage: 'Start'
      })
    }, {
      action: 'stop',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.stop',
        defaultMessage: 'Stop'
      })
    }, {
      action: 'pause',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.pause',
        defaultMessage: 'Pause'
      })
    }, {
      action: 'remove',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.remove',
        defaultMessage: 'Remove'
      })
    }, {
      action: 'check-hash',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.check.hash',
        defaultMessage: 'Check Hash'
      })
    }, {
      type: 'separator'
    }, {
      action: 'set-taxonomy',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.set.tags',
        defaultMessage: 'Set Tags'
      })
    }, {
      action: 'move',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.move',
        defaultMessage: 'Download Location...'
      })
    }, {
      action: 'set-priority',
      clickHandler,
      dismissMenu: false,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.priority',
        defaultMessage: 'Priority'
      }),
      labelAction: (
        <PriorityMeter id={torrent.hash} key={torrent.hash}
          bindExternalChangeHandler={this.bindExternalPriorityChangeHandler}
          level={torrent.priority} maxLevel={3} priorityType="torrent"
          onChange={this.handleTorrentPriorityChange} showLabel={false} />
      )
    }];
  }

  handleContextMenuItemClick(action, event) {
    let selectedTorrents = TorrentStore.getSelectedTorrents();
    switch (action) {
      case 'check-hash':
        TorrentActions.checkHash(selectedTorrents);
        break;
      case 'set-taxonomy':
        UIActions.displayModal({id: 'set-taxonomy'});
        break;
      case 'start':
        TorrentActions.startTorrents(selectedTorrents);
        break;
      case 'stop':
        TorrentActions.stopTorrents(selectedTorrents);
        break;
      case 'pause':
        TorrentActions.pauseTorrents(selectedTorrents);
        break;
      case 'remove':
        UIActions.displayModal({id: 'remove-torrents'});
        break;
      case 'move':
        UIActions.displayModal({id: 'move-torrents'});
        break;
      case 'set-priority':
        this.state.handleTorrentPriorityChange(event);
        break;
    }
  }

  handleDetailsClick(torrent, event) {
    UIActions.handleDetailsClick({
      hash: torrent.hash,
      event
    });

    UIActions.displayModal({
      id: 'torrent-details',
      options: {hash: torrent.hash}
    });
  }

  handleRightClick(torrent, event) {
    event.preventDefault();

    UIStore.setActiveContextMenu({
      clickPosition: {
        x: event.clientX,
        y: event.clientY
      },
      items: this.getContextMenuItems(torrent)
    });
  }

  handleTorrentClick(hash, event) {
    UIActions.handleTorrentClick({hash, event});
  }

  handleTorrentPriorityChange(hash, level) {
    TorrentActions.setPriority(hash, level);
  }

  onContextMenuChange() {
    this.setState({contextMenu: UIStore.getActiveContextMenu()});
  }

  onReceiveTorrentsError() {
    this.setState({torrentRequestError: true, torrentRequestSuccess: false});
  }

  onReceiveTorrentsSuccess() {
    let torrents = TorrentStore.getTorrents();

    this.setState({
      emptyTorrentList: torrents.length === 0,
      torrents,
      torrentCount: torrents.length,
      torrentRequestError: false,
      torrentRequestSuccess: true
    }, () => UIStore.satisfyDependency('torrent-list'));
  }

  onTorrentFilterChange() {
    this.forceUpdate();
  }

  onTorrentSelectionChange() {
    this.forceUpdate();
  }

  getEmptyTorrentListNotification() {
    let clearFilters = null;

    if (TorrentFilterStore.isFilterActive()) {
      clearFilters = (
        <div className="torrents__alert__action">
          <button className="button button--small button--deemphasize
            button--inverse" onClick={this.handleClearFiltersClick}>
            <FormattedMessage
              id="torrents.list.clear.filters"
              defaultMessage="Clear Filters"
            />
          </button>
        </div>
      );
    }

    return (
      <div className="torrents__alert__wrapper">
        <div className="torrents__alert">
          <FormattedMessage
            id="torrents.list.no.torrents"
            defaultMessage="No torrents to display."
          />
        </div>
        {clearFilters}
      </div>
    );
  }

  getLoadingIndicator() {
    return <LoadingIndicator />;
  }

  handleClearFiltersClick() {
    TorrentFilterStore.clearAllFilters();
  }

  renderListItem(index) {
    const selectedTorrents = TorrentStore.getSelectedTorrents();
    const {torrents} = this.state;
    const torrent = torrents[index];
    const {hash} = torrent;

    return (
      <Torrent key={hash}
        torrent={torrent}
        selected={selectedTorrents.includes(hash)}
        handleClick={this.handleTorrentClick}
        handleRightClick={this.handleRightClick}
        handleDetailsClick={this.handleDetailsClick} />
    );
  }

  render() {
    let content = null;
    let contextMenu = null;

    if (this.state.emptyTorrentList || this.state.torrents.length === 0) {
      content = this.getEmptyTorrentListNotification();
    } else if (this.state.torrentRequestSuccess) {
      content = (
        <ListViewport itemRenderer={this.renderListItem}
          listClass="torrent__list"
          listLength={this.state.torrentCount}
          scrollContainerClass="torrent__list__wrapper--custom-scroll" />
      );
    } else {
      content = this.getLoadingIndicator();
    }

    if (this.state.contextMenu != null) {
      contextMenu = (
        <ContextMenu clickPosition={this.state.contextMenu.clickPosition}
          items={this.state.contextMenu.items} />
      );
    }

    return (
      <div className="torrents">
        <div className="torrent__list__wrapper">
          <CSSTransitionGroup
            transitionName="menu"
            transitionEnterTimeout={250}
            transitionLeaveTimeout={250}>
            {contextMenu}
          </CSSTransitionGroup>
          {content}
        </div>
      </div>
    );
  }
}

export default injectIntl(TorrentListContainer);
