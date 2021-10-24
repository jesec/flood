import debounce from 'lodash/debounce';
import {forwardRef, MutableRefObject, ReactElement, ReactNode, useEffect, useRef, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';
import {useEnsuredForwardedRef} from 'react-use';

import {Checkbox, ContextMenu, FormElementAddon, FormRow, FormRowGroup, Portal, Textbox} from '@client/ui';
import {Search} from '@client/ui/icons';
import SettingStore from '@client/stores/SettingStore';

import FilesystemBrowser from '../filesystem/FilesystemBrowser';

interface FilesystemBrowserTextboxProps {
  id: string;
  label?: ReactNode;
  selectable?: 'directories' | 'files';
  suggested?: string;
  showBasePathToggle?: boolean;
  showCompletedToggle?: boolean;
  showSequentialToggle?: boolean;
  onChange?: (destination: string) => void;
}

const FilesystemBrowserTextbox = forwardRef<HTMLInputElement, FilesystemBrowserTextboxProps>(
  (
    {
      id,
      label,
      selectable,
      suggested,
      showBasePathToggle,
      showCompletedToggle,
      showSequentialToggle,
      onChange,
    }: FilesystemBrowserTextboxProps,
    ref,
  ) => {
    const [destination, setDestination] = useState<string>(
      suggested ||
        SettingStore.floodSettings.torrentDestinations?.[''] ||
        SettingStore.clientSettings?.directoryDefault ||
        '',
    );
    const [isDirectoryListOpen, setIsDirectoryListOpen] = useState<boolean>(false);

    const formRowRef = useRef<HTMLDivElement>(null);
    const textboxRef = useEnsuredForwardedRef(ref as MutableRefObject<HTMLInputElement>);

    const {i18n} = useLingui();

    useEffect(() => {
      const closeDirectoryList = (): void => {
        setIsDirectoryListOpen(false);
      };

      const handleDocumentClick = (e: Event): void => {
        if (!formRowRef.current?.contains(e.target as unknown as Node)) {
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

    const toggles: Array<ReactElement> = [];
    if (showBasePathToggle) {
      toggles.push(
        <Checkbox grow={false} id="isBasePath" key="isBasePath">
          <Trans id="torrents.destination.base_path" />
        </Checkbox>,
      );
    }
    if (showCompletedToggle) {
      toggles.push(
        <Checkbox grow={false} id="isCompleted" key="isCompleted">
          <Trans id="torrents.destination.completed" />
        </Checkbox>,
      );
    }
    if (showSequentialToggle) {
      // TODO: this is getting bloated. toggles can be moved to their own elements...
      toggles.push(
        <Checkbox grow={false} id="isSequential" key="isSequential">
          <Trans id="torrents.destination.sequential" />
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
            placeholder={i18n._('torrents.add.destination.placeholder')}
            ref={textboxRef}
          >
            <FormElementAddon
              onClick={() => {
                if (textboxRef.current != null) {
                  setDestination(textboxRef.current.value);
                }
                setIsDirectoryListOpen(!isDirectoryListOpen);
              }}
            >
              <Search />
            </FormElementAddon>
            <Portal>
              <ContextMenu
                isIn={isDirectoryListOpen}
                onClick={(event) => event.nativeEvent.stopImmediatePropagation()}
                overlayProps={{isInteractive: false}}
                padding={false}
                triggerRef={textboxRef}
              >
                <FilesystemBrowser
                  directory={destination}
                  selectable={selectable}
                  onItemSelection={(newDestination: string, shouldKeepOpen = true) => {
                    if (textboxRef.current != null) {
                      textboxRef.current.value = newDestination;
                    }

                    setIsDirectoryListOpen(shouldKeepOpen);
                    setDestination(newDestination);
                  }}
                  onYieldFocus={() => {
                    textboxRef.current?.focus();
                  }}
                />
              </ContextMenu>
            </Portal>
          </Textbox>
        </FormRow>
        {toggles.length > 0 ? <FormRow>{toggles}</FormRow> : null}
      </FormRowGroup>
    );
  },
);

FilesystemBrowserTextbox.defaultProps = {
  label: undefined,
  selectable: undefined,
  suggested: undefined,
  showBasePathToggle: false,
  showCompletedToggle: false,
  showSequentialToggle: false,
  onChange: undefined,
};

export default FilesystemBrowserTextbox;
