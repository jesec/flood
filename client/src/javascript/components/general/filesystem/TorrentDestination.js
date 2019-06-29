import _ from 'lodash';
import {Checkbox, ContextMenu, FormElementAddon, FormRow, FormRowGroup, Portal, Textbox} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import EventTypes from '../../../constants/EventTypes';
import FilesystemBrowser from './FilesystemBrowser';
import Search from '../../icons/Search';
import SettingsStore from '../../../stores/SettingsStore';
import UIStore from '../../../stores/UIStore';

class NewTorrentDestination extends React.Component {
  contextMenuInstanceRef = null;

  contextMenuNodeRef = null;

  textboxRef = null;

  constructor(props) {
    super(props);

    const destination =
      props.suggested ||
      SettingsStore.getFloodSettings('torrentDestination') ||
      SettingsStore.getClientSettings('directoryDefault') ||
      '';

    this.state = {
      destination,
      isDirectoryListOpen: false,
    };
  }

  componentDidMount() {
    UIStore.listen(EventTypes.UI_MODAL_DISMISSED, this.handleModalDismiss);
    // TODO: Fix ContextMenu in flood-ui-kit and remove the forced double render
    // https://github.com/jfurrow/flood-ui-kit/issues/6
    this.forceUpdate();
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

  /* eslint-disable react/sort-comp */
  handleDestinationInputChange = _.debounce(
    () => {
      const destination = this.textboxRef.value;

      if (this.props.onChange) {
        this.props.onChange(destination);
      }

      this.setState({destination});
    },
    100,
    {leading: true},
  );
  /* eslint-enable react/sort-comp */

  handleDirectoryListButtonClick = () => {
    this.setState(state => {
      const isOpening = !state.isDirectoryListOpen;

      return {
        isDirectoryListOpen: isOpening,
      };
    });
  };

  handleDirectorySelection = destination => {
    this.textboxRef.value = destination;
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

  removeDestinationOpenEventListeners() {
    global.document.removeEventListener('click', this.handleDocumentClick);
    global.removeEventListener('resize', this.handleWindowResize);
  }

  toggleOpenState = () => {
    this.setState(state => {
      return {
        isDirectoryListOpen: !state.isDirectoryListOpen,
      };
    });
  };

  render() {
    const {destination, isDirectoryListOpen} = this.state;

    return (
      <FormRowGroup>
        <FormRow>
          <Textbox
            addonPlacement="after"
            defaultValue={destination}
            id={this.props.id}
            label={this.props.label}
            onChange={this.handleDestinationInputChange}
            onClick={event => event.nativeEvent.stopImmediatePropagation()}
            placeholder={this.props.intl.formatMessage({
              id: 'torrents.add.destination.placeholder',
              defaultMessage: 'Destination',
            })}
            setRef={ref => {
              this.textboxRef = ref;
            }}>
            <FormElementAddon onClick={this.handleDirectoryListButtonClick}>
              <Search />
            </FormElementAddon>
            <Portal>
              <ContextMenu
                in={isDirectoryListOpen}
                onClick={event => event.nativeEvent.stopImmediatePropagation()}
                overlayProps={{isInteractive: false}}
                padding={false}
                ref={ref => {
                  this.contextMenuInstanceRef = ref;
                }}
                setRef={ref => {
                  this.contextMenuNodeRef = ref;
                }}
                scrolling={false}
                triggerRef={this.textboxRef}>
                <FilesystemBrowser
                  directory={destination}
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
