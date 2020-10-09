import debounce from 'lodash/debounce';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {Checkbox, ContextMenu, FormElementAddon, FormRow, FormRowGroup, Portal, Textbox} from '../../../ui';
import FilesystemBrowser from './FilesystemBrowser';
import Search from '../../icons/Search';
import SettingsStore from '../../../stores/SettingsStore';
import UIStore from '../../../stores/UIStore';

interface FilesystemBrowserTextboxProps extends WrappedComponentProps {
  id: string;
  label?: React.ReactNode;
  selectable?: 'directories' | 'files';
  suggested?: string;
  basePathToggle?: boolean;
  onChange?: (destination: string) => void;
}

interface FilesystemBrowserTextboxStates {
  destination: string;
  isDirectoryListOpen: boolean;
}

class FilesystemBrowserTextbox extends React.Component<FilesystemBrowserTextboxProps, FilesystemBrowserTextboxStates> {
  contextMenuInstanceRef: ContextMenu | null = null;

  contextMenuNodeRef: HTMLDivElement | null = null;

  textboxRef: HTMLInputElement | null = null;

  constructor(props: FilesystemBrowserTextboxProps) {
    super(props);

    const destination: string =
      props.suggested ||
      SettingsStore.getFloodSetting('torrentDestination') ||
      (SettingsStore.getClientSetting('directoryDefault') as string | undefined) ||
      '';

    this.state = {
      destination,
      isDirectoryListOpen: false,
    };
  }

  componentDidMount() {
    UIStore.listen('UI_MODAL_DISMISSED', this.handleModalDismiss);
    // TODO: Fix ContextMenu in flood-ui-kit and remove the forced double render
    // https://github.com/jfurrow/flood-ui-kit/issues/6
    this.forceUpdate();
  }

  componentDidUpdate(_prevProps: FilesystemBrowserTextboxProps, prevState: FilesystemBrowserTextboxStates) {
    if (!prevState.isDirectoryListOpen && this.state.isDirectoryListOpen) {
      this.addDestinationOpenEventListeners();
    } else if (prevState.isDirectoryListOpen && !this.state.isDirectoryListOpen) {
      this.removeDestinationOpenEventListeners();
    }
  }

  componentWillUnmount() {
    UIStore.unlisten('UI_MODAL_DISMISSED', this.handleModalDismiss);
    this.removeDestinationOpenEventListeners();
  }

  addDestinationOpenEventListeners() {
    document.addEventListener('click', this.handleDocumentClick);
    window.addEventListener('resize', this.handleWindowResize);
  }

  closeDirectoryList = () => {
    if (this.state.isDirectoryListOpen) {
      this.setState({isDirectoryListOpen: false});
    }
  };

  /* eslint-disable react/sort-comp */
  handleDestinationInputChange = debounce(
    () => {
      if (this.textboxRef == null) {
        return;
      }

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
    this.setState((state) => {
      const isOpening = !state.isDirectoryListOpen;

      return {
        isDirectoryListOpen: isOpening,
      };
    });
  };

  handleItemSelection = (destination: string, isDirectory = true) => {
    if (this.textboxRef != null) {
      this.textboxRef.value = destination;
    }
    this.setState({destination, isDirectoryListOpen: isDirectory});
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
    document.removeEventListener('click', this.handleDocumentClick);
    window.removeEventListener('resize', this.handleWindowResize);
  }

  toggleOpenState = () => {
    this.setState((state) => {
      return {
        isDirectoryListOpen: !state.isDirectoryListOpen,
      };
    });
  };

  render() {
    const {destination, isDirectoryListOpen} = this.state;

    const basePathToggle = this.props.basePathToggle ? (
      <FormRow>
        <Checkbox grow={false} id="isBasePath">
          <FormattedMessage id="torrents.destination.base_path" />
        </Checkbox>
      </FormRow>
    ) : null;

    return (
      <FormRowGroup>
        <FormRow>
          <Textbox
            addonPlacement="after"
            defaultValue={destination}
            id={this.props.id}
            label={this.props.label}
            onChange={this.handleDestinationInputChange}
            onClick={(event) => event.nativeEvent.stopImmediatePropagation()}
            placeholder={this.props.intl.formatMessage({
              id: 'torrents.add.destination.placeholder',
            })}
            setRef={(ref) => {
              this.textboxRef = ref;
            }}>
            <FormElementAddon onClick={this.handleDirectoryListButtonClick}>
              <Search />
            </FormElementAddon>
            <Portal>
              <ContextMenu
                in={isDirectoryListOpen}
                onClick={(event) => event.nativeEvent.stopImmediatePropagation()}
                overlayProps={{isInteractive: false}}
                padding={false}
                ref={(ref) => {
                  this.contextMenuInstanceRef = ref;
                }}
                setRef={(ref) => {
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
                  selectable={this.props.selectable}
                  onItemSelection={this.handleItemSelection}
                />
              </ContextMenu>
            </Portal>
          </Textbox>
        </FormRow>
        {basePathToggle}
      </FormRowGroup>
    );
  }
}

export default injectIntl(FilesystemBrowserTextbox, {forwardRef: true});
