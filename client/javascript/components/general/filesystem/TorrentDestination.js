import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import {defineMessages, formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import AddMini from '../../../components/icons/AddMini';
import ArrowIcon from '../../../components/icons/ArrowIcon';
import File from '../../../components/icons/File';
import FolderClosedSolid from '../../../components/icons/FolderClosedSolid';
import Checkbox from '../../general/form-elements/Checkbox';
import CustomScrollbars from '../../../components/general/CustomScrollbars';
import EventTypes from '../../../constants/EventTypes';
import Portal from '../../../components/general/Portal';
import Search from '../../../components/icons/Search';
import SettingsStore from '../../../stores/SettingsStore';
import UIStore from '../../../stores/UIStore';

const MAX_PANEL_HEIGHT = 300;

const MESSAGES = defineMessages({
  EACCES: {
    id: 'filesystem.error.eacces',
    defaultMessage: 'Flood does not have permission to read this directory.'
  },
  ENOENT: {
    id: 'filesystem.error.enoent',
    defaultMessage: 'This path does not exist. It will be created.'
  },
  emptyDirectory: {
    id: 'filesystem.empty.directory',
    defaultMessage: 'Empty directory.'
  },
  fetching: {
    id: 'filesystem.fetching',
    defaultMessage: 'Fetching directory structure...'
  }
});

const METHODS_TO_BIND = [
  'handleBasePathCheckBoxCheck',
  'handleDestinationChange',
  'handleDirectoryClick',
  'handleDirectoryListButtonClick',
  'handleDirectoryListFetchError',
  'handleDirectoryListFetchSuccess',
  'handleDocumentClick',
  'handleModalDismiss',
  'handleParentDirectoryClick',
  'updateAttachedPanelPosition'
];

class TorrentDestination extends React.Component {
  constructor(props) {
    super();

    let baseDestination = SettingsStore.getFloodSettings('torrentDestination')
      || SettingsStore.getClientSettings('directoryDefault')
      || '';

    if (props.suggested) {
      baseDestination = props.suggested;
    }

    this.state = {
      attachedPanelMaxHeight: MAX_PANEL_HEIGHT,
      baseDestination,
      destination: baseDestination,
      isBasePath: false,
      error: null,
      directories: null,
      files: null,
      isFetching: false,
      isDirectoryListOpen: false,
      separator: '/'
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

  }

  componentDidMount() {
    UIStore.listen(EventTypes.FLOOD_FETCH_DIRECTORY_LIST_ERROR,
      this.handleDirectoryListFetchError);
    UIStore.listen(EventTypes.FLOOD_FETCH_DIRECTORY_LIST_SUCCESS,
      this.handleDirectoryListFetchSuccess);
    UIStore.listen(EventTypes.UI_MODAL_DISMISSED, this.handleModalDismiss);
    UIStore.fetchDirectoryList({path: this.state.baseDestination});

    global.addEventListener('resize', this.updateAttachedPanelPosition);
    global.document.addEventListener('click', this.handleDocumentClick);
  }

  componentDidUpdate() {
    this.updateAttachedPanelPosition();
  }

  componentWillUnmount() {
    UIStore.unlisten(EventTypes.FLOOD_FETCH_DIRECTORY_LIST_ERROR,
      this.handleDirectoryListFetchError);
    UIStore.unlisten(EventTypes.FLOOD_FETCH_DIRECTORY_LIST_SUCCESS,
      this.handleDirectoryListFetchSuccess);
    UIStore.unlisten(EventTypes.UI_MODAL_DISMISSED, this.handleModalDismiss);
    global.removeEventListener('resize', this.updateAttachedPanelPosition);
    global.document.removeEventListener('click', this.handleDocumentClick);
  }

  getNewDestination(directory) {
    let {baseDestination: newDestination, separator} = this.state;

    if (newDestination.endsWith(separator)) {
      return `${newDestination}${directory}`;
    }

    return `${newDestination}${separator}${directory}`;
  }

  getDirectoryList() {
    let {
      attachedPanelMaxHeight,
      directories,
      error,
      files = [],
      hasParent
    } = this.state;
    let errorMessage = null;
    let listItems = null;
    let parentDirectory = null;
    let shouldShowDirectoryList = true;
    let shouldForceShowParentDirectory = false;

    if (directories == null) {
      shouldShowDirectoryList = false;
      errorMessage = (
        <em>
          {this.props.intl.formatMessage(MESSAGES.fetching)}
        </em>
      );
    }

    if (error && error.data && error.data.code && MESSAGES[error.data.code]) {
      shouldShowDirectoryList = false;

      if (error.data.code === 'EACCES') {
        shouldForceShowParentDirectory = true;
      }

      errorMessage = (
        <em>
          {this.props.intl.formatMessage(MESSAGES[error.data.code])}
        </em>
      );
    }

    if (hasParent || shouldForceShowParentDirectory) {
      parentDirectory = (
        <li className="filesystem__directory-list__item
          filesystem__directory-list__item--parent"
          onClick={() => {this.handleParentDirectoryClick();}}>
          <ArrowIcon />
          {this.props.intl.formatMessage({
            id: 'filesystem.parent.directory',
            defaultMessage: 'Parent Directory'
          })}
        </li>
      );
    }

    if (shouldShowDirectoryList) {
      let directoryList = directories.map((directory, index) => {
        return (
          <li className="filesystem__directory-list__item
            filesystem__directory-list__item--directory"
            key={index}
            onClick={() => {this.handleDirectoryClick(directory);}}>
            <FolderClosedSolid />
            {directory}
          </li>
        );
      });
      let filesList = files.map((file, index) => {
        return (
          <li className="filesystem__directory-list__item
            filesystem__directory-list__item--file"
            key={`file.${index}`}>
            <File />
            {file}
          </li>
        );
      });

      listItems = directoryList.concat(filesList);
    }

    if ((!listItems || listItems.length === 0) && !errorMessage) {
      errorMessage = (
        <em>
          {this.props.intl.formatMessage(MESSAGES.emptyDirectory)}
        </em>
      );
    }

    return (
      <div className="attached-panel"
        onClick={this.handlePanelClick}
        ref={(ref) => {this.attachedPanelRef = ref;}}>
        <CustomScrollbars
          autoHeight={true}
          autoHeightMax={attachedPanelMaxHeight}
          inverted={true}>
          <div className="attached-panel__content filesystem__directory-list">
            {parentDirectory}
            {errorMessage}
            {listItems}
          </div>
        </CustomScrollbars>
      </div>
    );
  }

  getValue() {
    return this.getDestination();
  }

  getDestination() {
    return this.state.destination;
  }

  isBasePath() {
    return this.state.isBasePath;
  }

  handleBasePathCheckBoxCheck(value) {
    this.setState({isBasePath: value});
  }

  handleDestinationChange(event) {
    let destination = event.target.value;

    if (this.props.onChange) {
      this.props.onChange(destination);
    }

    this.setState({baseDestination: destination, destination});

    if (this.state.isDirectoryListOpen) {
      UIStore.fetchDirectoryList({path: destination});
    }
  }

  handleDirectoryListButtonClick(event) {
    event.nativeEvent.stopImmediatePropagation();

    let isOpening = !this.state.isDirectoryListOpen;

    this.setState({
      isDirectoryListOpen: isOpening,
      isFetching: isOpening
    });

    if (isOpening) {
      UIStore.fetchDirectoryList({path: this.state.destination});
    }
  }

  handleDirectoryClick(directory) {
    let newDestination = this.getNewDestination(directory);

    this.setState({
      baseDestination: newDestination,
      destination: newDestination,
      isFetching: true
    });

    if (this.props.onChange) {
      this.props.onChange(newDestination);
    }

    UIStore.fetchDirectoryList({path: newDestination});
  }

  handleDirectoryListFetchError(error) {
    let {baseDestination, destination, separator} = this.state;

    this.setState({
      error,
      isFetching: false
    });
  }

  handleDirectoryListFetchSuccess(response) {
    // response includes hasParent, separator, and an array of directories.
    this.setState({
      ...response,
      baseDestination: response.path,
      destination: response.path,
      error: null,
      isFetching: false
    });
  }

  handleDocumentClick() {
    if (this.state.isDirectoryListOpen) {
      this.setState({isDirectoryListOpen: false});
    }
  }

  handleModalDismiss() {
    if (this.state.isDirectoryListOpen) {
      this.setState({isDirectoryListOpen: false});
    }
  }

  handlePanelClick(event) {
    event.nativeEvent.stopImmediatePropagation();
  }

  handleParentDirectoryClick() {
    let {destination, separator} = this.state;

    if (destination.endsWith(separator)) {
      destination = destination.substring(0, destination.length - 1);
    }

    let destinationArr = destination.split(separator);
    destinationArr.pop();

    destination = destinationArr.join(separator);

    this.setState({
      baseDestination: destination,
      destination,
      isFetching: true
    });

    if (this.props.onChange) {
      this.props.onChange(destination);
    }

    UIStore.fetchDirectoryList({path: destination});
  }

  handleTextboxClick(event) {
    event.nativeEvent.stopImmediatePropagation();
  }

  updateAttachedPanelPosition() {
    if (this.state.isDirectoryListOpen) {
      global.requestAnimationFrame(() => {
        if (this.textboxRef && this.attachedPanelRef) {
          let windowHeight = window.innerHeight;
          let {height: panelHeight} = this.attachedPanelRef
            .getBoundingClientRect();
          let {left, bottom, width} = this.textboxRef.getBoundingClientRect();

          this.attachedPanelRef.setAttribute(
            'style', `left: ${left}px; top: ${bottom}px; width: ${width}px;`
          );

          if (bottom + panelHeight >= windowHeight) {
            let attachedPanelMaxHeight = Math.floor(windowHeight - bottom);

            if (this.state.attachedPanelMaxHeight !== attachedPanelMaxHeight) {
              this.setState({attachedPanelMaxHeight});
            }
          } else if (bottom + panelHeight + 10 < windowHeight
              && this.state.attachedPanelMaxHeight != MAX_PANEL_HEIGHT) {
            this.setState({attachedPanelMaxHeight: MAX_PANEL_HEIGHT});
          }
        }
      });
    }
  }

  render() {
    let textboxClasses = classnames('textbox', {
      'textbox--has-attached-panel--is-open': this.state.isDirectoryListOpen,
      'is-fulfilled': this.state.destination && this.state.destination !== ''
    });
    let directoryList = null;

    if (this.state.isDirectoryListOpen) {
      directoryList = this.getDirectoryList();
    }

    return (
      <div className="attached-panel__wrapper form__row">
        <div className="form__column form__column--large" style={{position: 'relative'}}>
          <input className={textboxClasses}
            onChange={this.handleDestinationChange}
            onClick={this.handleTextboxClick}
            placeholder={this.props.intl.formatMessage({
              id: 'torrents.add.destination.placeholder',
              defaultMessage: 'Destination'
            })}
            ref={(ref) => {this.textboxRef = ref;}}
            value={this.state.destination}
            type="text" />
          <div className="floating-action__group
            floating-action__group--on-textbox">
            <button className="floating-action__button
              floating-action__button--search"
              onClick={this.handleDirectoryListButtonClick}>
              <Search />
            </button>
          </div>
          <Portal>
            <CSSTransitionGroup transitionName="attached-panel"
              transitionEnterTimeout={250}
              transitionLeaveTimeout={250}>
              {directoryList}
            </CSSTransitionGroup>
          </Portal>
        </div>
        <div className="form__column form__column--auto">
          <Checkbox
            onChange={this.handleBasePathCheckBoxCheck}>
            <FormattedMessage
              id="torrents.destination.base_path"
              defaultMessage="Use as Base Path"
            />
          </Checkbox>
        </div>
      </div>
    );
  }
}

export default injectIntl(TorrentDestination, {withRef: true});
