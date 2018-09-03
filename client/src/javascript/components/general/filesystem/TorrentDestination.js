import _ from 'lodash';
import {Checkbox, ContextMenu, FormElementAddon, FormRow, FormRowGroup, Portal, Textbox} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import EventTypes from '../../../constants/EventTypes';
import FilesystemBrowser from './FilesystemBrowser';
import Search from '../../../components/icons/Search';
import SettingsStore from '../../../stores/SettingsStore';
import UIStore from '../../../stores/UIStore';

class NewTorrentDestination extends React.Component {
  contextMenuInstanceRef = null;
  contextMenuNodeRef = null;

  constructor(props) {
    super(props);

    const destination =
      props.suggested ||
      SettingsStore.getFloodSettings('torrentDestination') ||
      SettingsStore.getClientSettings('directoryDefault') ||
      '';

    this.state = {
      destination,
      isBasePath: false,
      error: null,
      directories: null,
      files: null,
      isFetching: false,
      isDirectoryListOpen: false,
    };

    this.handleWindowResize = _.debounce(this.handleWindowResize, 100);
  }

  componentDidMount() {
    UIStore.listen(EventTypes.UI_MODAL_DISMISSED, this.handleModalDismiss);
  }

  componentWillUpdate(_nextProps, nextState) {
    if (!this.state.isDirectoryListOpen && nextState.isDirectoryListOpen) {
      this.addDestinationOpenEventListeners();
    } else if (this.state.isDirectoryListOpen && !nextState.isDirectoryListOpen) {
      this.removeDestinationOpenEventListeners();
    }
  }

  componentWillUnmount() {
    UIStore.unlisten(EventTypes.UI_MODAL_DISMISSED, this.handleModalDismiss);
    this.removeDestinationOpenEventListeners();
  }

  addDestinationOpenEventListeners() {
    global.document.addEventListener('click', this.handleDocumentClick);
    global.addEventListener('resize', this.handleWindowResize);
  }

  closeDirectoryList = () => {
    if (this.state.isDirectoryListOpen) {
      this.setState({isDirectoryListOpen: false});
    }
  };

  getValue() {
    return this.getDestination();
  }

  getDestination() {
    return this.state.destination;
  }

  handleBasePathCheckBoxCheck = value => {
    this.setState({isBasePath: value});
  };

  handleDestinationChange = event => {
    const destination = event.target.value;

    if (this.props.onChange) {
      this.props.onChange(destination);
    }

    this.setState({destination});
  };

  handleDirectoryListButtonClick = event => {
    const isOpening = !this.state.isDirectoryListOpen;

    this.setState({
      isDirectoryListOpen: isOpening,
      isFetching: isOpening,
    });
  };

  handleDirectorySelection = destination => {
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.textboxRef.value = destination;
    this.setState({destination});
  };

  handleDocumentClick = () => {
    this.closeDirectoryList();
  };

  handleModalDismiss = () => {
    this.closeDirectoryList();
  };

  handleWindowResize = () => {
    this.closeDirectoryList();
  };

  isBasePath() {
    return this.state.isBasePath;
  }

  removeDestinationOpenEventListeners() {
    global.document.removeEventListener('click', this.handleDocumentClick);
    global.removeEventListener('resize', this.handleWindowResize);
  }

  setTextboxRef = ref => {
    if (this.state.textboxRef !== ref) {
      this.setState({textboxRef: ref});
    }
  };

  toggleOpenState = () => {
    this.setState({
      isDirectoryListOpen: !this.state.isDirectoryListOpen,
    });
  };

  render() {
    return (
      <FormRowGroup>
        <FormRow>
          <Textbox
            addonPlacement="after"
            defaultValue={this.state.destination}
            id={this.props.id}
            label={this.props.label}
            onChange={this.handleDestinationChange}
            onClick={event => event.nativeEvent.stopImmediatePropagation()}
            placeholder={this.props.intl.formatMessage({
              id: 'torrents.add.destination.placeholder',
              defaultMessage: 'Destination',
            })}
            setRef={this.setTextboxRef}>
            <FormElementAddon onClick={this.handleDirectoryListButtonClick}>
              <Search />
            </FormElementAddon>
            <Portal>
              <ContextMenu
                in={this.state.isDirectoryListOpen}
                onClick={event => event.nativeEvent.stopImmediatePropagation()}
                overlayProps={{isInteractive: false}}
                padding={false}
                ref={ref => (this.contextMenuInstanceRef = ref)}
                setRef={ref => (this.contextMenuNodeRef = ref)}
                scrolling={false}
                triggerRef={this.state.textboxRef}>
                <FilesystemBrowser
                  directory={this.state.destination}
                  intl={this.props.intl}
                  maxHeight={
                    this.contextMenuInstanceRef &&
                    this.contextMenuInstanceRef.dropdownStyle &&
                    this.contextMenuInstanceRef.dropdownStyle.maxHeight
                  }
                  onDirectorySelection={this.handleDirectorySelection}
                />
              </ContextMenu>
            </Portal>
          </Textbox>
        </FormRow>
        <FormRow>
          <Checkbox grow={false} id="useBasePath">
            <FormattedMessage id="torrents.destination.base_path" defaultMessage="Use as Base Path" />
          </Checkbox>
        </FormRow>
      </FormRowGroup>
    );
  }
}

export default injectIntl(NewTorrentDestination, {withRef: true});
