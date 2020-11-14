import debounce from 'lodash/debounce';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {when} from 'mobx';
import * as React from 'react';

import {Checkbox, ContextMenu, FormElementAddon, FormRow, FormRowGroup, Portal, Textbox} from '../../../ui';
import FilesystemBrowser from './FilesystemBrowser';
import Search from '../../icons/Search';
import SettingStore from '../../../stores/SettingStore';
import UIStore from '../../../stores/UIStore';

interface FilesystemBrowserTextboxProps extends WrappedComponentProps {
  id: string;
  label?: React.ReactNode;
  selectable?: 'directories' | 'files';
  suggested?: string;
  showBasePathToggle?: boolean;
  showCompletedToggle?: boolean;
  onChange?: (destination: string) => void;
}

interface FilesystemBrowserTextboxStates {
  destination: string;
  isDirectoryListOpen: boolean;
}

class FilesystemBrowserTextbox extends React.Component<FilesystemBrowserTextboxProps, FilesystemBrowserTextboxStates> {
  formRowRef = React.createRef<HTMLDivElement>();
  textboxRef = React.createRef<HTMLInputElement>();

  constructor(props: FilesystemBrowserTextboxProps) {
    super(props);

    when(
      () => UIStore.activeModal == null,
      () => this.handleModalDismiss,
    );

    const destination: string =
      props.suggested ||
      SettingStore.floodSettings.torrentDestination ||
      SettingStore.clientSettings?.directoryDefault ||
      '';

    this.state = {
      destination,
      isDirectoryListOpen: false,
    };
  }

  componentDidMount() {
    // TODO: Fix ContextMenu in flood-ui-kit and remove the forced double render
    // https://github.com/jfurrow/flood-ui-kit/issues/6
    this.forceUpdate();
  }

  componentDidUpdate(_prevProps: FilesystemBrowserTextboxProps, prevState: FilesystemBrowserTextboxStates) {
    const {isDirectoryListOpen} = this.state;

    if (!prevState.isDirectoryListOpen && isDirectoryListOpen) {
      this.addDestinationOpenEventListeners();
    } else if (prevState.isDirectoryListOpen && !isDirectoryListOpen) {
      this.removeDestinationOpenEventListeners();
    }
  }

  componentWillUnmount() {
    this.removeDestinationOpenEventListeners();
  }

  closeDirectoryList = () => {
    if (this.state.isDirectoryListOpen) {
      this.setState({isDirectoryListOpen: false});
    }
  };

  /* eslint-disable react/sort-comp */
  handleDestinationInputChange = debounce(
    () => {
      if (this.textboxRef.current == null) {
        return;
      }

      const destination = this.textboxRef.current.value;

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
    if (this.textboxRef.current != null) {
      this.textboxRef.current.value = destination;
    }
    this.setState({destination, isDirectoryListOpen: isDirectory});
  };

  handleDocumentClick = (e: Event) => {
    if (!this.formRowRef.current?.contains((e.target as unknown) as Node)) {
      this.closeDirectoryList();
    }
  };

  handleModalDismiss = () => {
    this.closeDirectoryList();
  };

  handleWindowResize = () => {
    this.closeDirectoryList();
  };

  toggleOpenState = () => {
    this.setState((state) => {
      return {
        isDirectoryListOpen: !state.isDirectoryListOpen,
      };
    });
  };

  removeDestinationOpenEventListeners() {
    document.removeEventListener('click', this.handleDocumentClick);
    window.removeEventListener('resize', this.handleWindowResize);
  }

  addDestinationOpenEventListeners() {
    document.addEventListener('click', this.handleDocumentClick);
    window.addEventListener('resize', this.handleWindowResize);
  }

  render() {
    const {intl, id, label, selectable, showBasePathToggle, showCompletedToggle} = this.props;
    const {destination, isDirectoryListOpen} = this.state;

    const toggles: React.ReactNodeArray = [];

    if (showBasePathToggle) {
      toggles.push(
        <Checkbox grow={false} id="isBasePath" key="isBasePath">
          <FormattedMessage id="torrents.destination.base_path" />
        </Checkbox>,
      );
    }

    if (showCompletedToggle) {
      toggles.push(
        <Checkbox grow={false} id="isCompleted" key="isCompleted">
          <FormattedMessage id="torrents.destination.completed" />
        </Checkbox>,
      );
    }

    return (
      <FormRowGroup ref={this.formRowRef}>
        <FormRow>
          <Textbox
            addonPlacement="after"
            defaultValue={destination}
            id={id}
            label={label}
            onChange={this.handleDestinationInputChange}
            onClick={(event) => event.nativeEvent.stopImmediatePropagation()}
            placeholder={intl.formatMessage({
              id: 'torrents.add.destination.placeholder',
            })}
            ref={this.textboxRef}>
            <FormElementAddon onClick={this.handleDirectoryListButtonClick}>
              <Search />
            </FormElementAddon>
            <Portal>
              <ContextMenu
                isIn={isDirectoryListOpen}
                onClick={(event) => event.nativeEvent.stopImmediatePropagation()}
                overlayProps={{isInteractive: false}}
                padding={false}
                triggerRef={this.textboxRef}>
                <FilesystemBrowser
                  directory={destination}
                  intl={intl}
                  selectable={selectable}
                  onItemSelection={this.handleItemSelection}
                />
              </ContextMenu>
            </Portal>
          </Textbox>
        </FormRow>
        {toggles.length > 0 ? <FormRow>{toggles}</FormRow> : null}
      </FormRowGroup>
    );
  }
}

export default injectIntl(FilesystemBrowserTextbox, {forwardRef: true});
