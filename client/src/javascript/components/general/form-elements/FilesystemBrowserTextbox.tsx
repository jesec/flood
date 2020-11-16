import debounce from 'lodash/debounce';
import {FormattedMessage, useIntl} from 'react-intl';
import {FC, ReactNode, useEffect, useRef, useState} from 'react';

import {Checkbox, ContextMenu, FormElementAddon, FormRow, FormRowGroup, Portal, Textbox} from '../../../ui';
import FilesystemBrowser from '../filesystem/FilesystemBrowser';
import Search from '../../icons/Search';
import SettingStore from '../../../stores/SettingStore';

interface FilesystemBrowserTextboxProps {
  id: string;
  label?: ReactNode;
  selectable?: 'directories' | 'files';
  suggested?: string;
  showBasePathToggle?: boolean;
  showCompletedToggle?: boolean;
  onChange?: (destination: string) => void;
}

const FilesystemBrowserTextbox: FC<FilesystemBrowserTextboxProps> = ({
  id,
  label,
  selectable,
  suggested,
  showBasePathToggle,
  showCompletedToggle,
  onChange,
}: FilesystemBrowserTextboxProps) => {
  const [destination, setDestination] = useState<string>(
    suggested ?? SettingStore.floodSettings.torrentDestination ?? SettingStore.clientSettings?.directoryDefault ?? '',
  );
  const [isDirectoryListOpen, setIsDirectoryListOpen] = useState<boolean>(false);

  const formRowRef = useRef<HTMLDivElement>(null);
  const textboxRef = useRef<HTMLInputElement>(null);

  const intl = useIntl();

  useEffect(() => {
    const closeDirectoryList = (): void => {
      setIsDirectoryListOpen(false);
    };

    const handleDocumentClick = (e: Event): void => {
      if (!formRowRef.current?.contains((e.target as unknown) as Node)) {
        closeDirectoryList();
      }
    };

    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('resize', closeDirectoryList);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('resize', closeDirectoryList);
    };
  }, []);

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
    <FormRowGroup ref={formRowRef}>
      <FormRow>
        <Textbox
          autoComplete={isDirectoryListOpen ? 'off' : undefined}
          addonPlacement="after"
          defaultValue={destination}
          id={id}
          label={label}
          onChange={debounce(
            () => {
              if (textboxRef.current == null) {
                return;
              }

              const newDestination = textboxRef.current.value;

              if (onChange) {
                onChange(newDestination);
              }

              setDestination(newDestination);
            },
            100,
            {leading: true},
          )}
          onClick={(event) => event.nativeEvent.stopImmediatePropagation()}
          placeholder={intl.formatMessage({
            id: 'torrents.add.destination.placeholder',
          })}
          ref={textboxRef}>
          <FormElementAddon
            onClick={() => {
              setIsDirectoryListOpen(!isDirectoryListOpen);
            }}>
            <Search />
          </FormElementAddon>
          <Portal>
            <ContextMenu
              isIn={isDirectoryListOpen}
              onClick={(event) => event.nativeEvent.stopImmediatePropagation()}
              overlayProps={{isInteractive: false}}
              padding={false}
              triggerRef={textboxRef}>
              <FilesystemBrowser
                directory={destination}
                intl={intl}
                selectable={selectable}
                onItemSelection={(newDestination: string, isDirectory = true) => {
                  if (textboxRef.current != null) {
                    textboxRef.current.value = newDestination;
                  }

                  setDestination(newDestination);
                  setIsDirectoryListOpen(isDirectory);
                }}
              />
            </ContextMenu>
          </Portal>
        </Textbox>
      </FormRow>
      {toggles.length > 0 ? <FormRow>{toggles}</FormRow> : null}
    </FormRowGroup>
  );
};

FilesystemBrowserTextbox.defaultProps = {
  label: undefined,
  selectable: undefined,
  suggested: undefined,
  showBasePathToggle: false,
  showCompletedToggle: false,
  onChange: undefined,
};

export default FilesystemBrowserTextbox;
