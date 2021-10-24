import classnames from 'classnames';
import {FC, ReactElement, ReactNode, useEffect, useRef, useState} from 'react';
import {sort} from 'fast-sort';
import {Trans} from '@lingui/react';
import {useKeyPressEvent} from 'react-use';

import {ContextMenu, FormElementAddon, FormRowItem, Portal, SelectItem, Textbox} from '@client/ui';
import {Chevron} from '@client/ui/icons';
import SettingStore from '@client/stores/SettingStore';
import TorrentFilterStore from '@client/stores/TorrentFilterStore';

import type {TorrentProperties} from '@shared/types/Torrent';

interface TagSelectProps {
  id?: string;
  label?: ReactNode;
  defaultValue?: TorrentProperties['tags'];
  placeholder?: string;
  onTagSelected?: (tags: TorrentProperties['tags']) => void;
}

const TagSelect: FC<TagSelectProps> = ({defaultValue, placeholder, id, label, onTagSelected}: TagSelectProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<Array<string>>(defaultValue ?? []);
  const formRowRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const textboxRef = useRef<HTMLInputElement>(null);

  const classes = classnames('select form__element', {
    'select--is-open': isOpen,
  });

  useKeyPressEvent('Escape', (e) => {
    e.preventDefault();
    setIsOpen(false);
  });

  useEffect(() => {
    const handleDocumentClick = (e: Event) => {
      if (!formRowRef.current?.contains(e.target as unknown as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (textboxRef.current != null) {
      textboxRef.current.value = selectedTags.join();
    }
    if (onTagSelected) {
      onTagSelected(selectedTags);
    }
  }, [selectedTags, onTagSelected]);

  return (
    <FormRowItem ref={formRowRef}>
      <div className={classes}>
        <Textbox
          autoComplete={isOpen ? 'off' : undefined}
          id={id || 'tags'}
          addonPlacement="after"
          defaultValue={defaultValue}
          label={label}
          onChange={() => {
            if (textboxRef.current != null) {
              let selectedTagsArray = textboxRef.current.value
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

              if (textboxRef.current.value.trimEnd().endsWith(',')) {
                // Ensures that the trailing ',' does not get removed automatically.
                selectedTagsArray.push('');

                // Deduplicate
                selectedTagsArray = [...new Set(selectedTagsArray)];
              }

              setSelectedTags(selectedTagsArray);
            }
          }}
          placeholder={placeholder}
          ref={textboxRef}
        >
          <FormElementAddon
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className="select__indicator"
          >
            <Chevron />
          </FormElementAddon>
          <Portal>
            <ContextMenu
              isIn={isOpen}
              onClick={(event) => {
                if (SettingStore.floodSettings.UITagSelectorMode !== 'single') {
                  event.nativeEvent.stopImmediatePropagation();
                }
              }}
              overlayProps={{isInteractive: false}}
              ref={menuRef}
              triggerRef={textboxRef}
            >
              {[
                ...new Set([
                  'untagged',
                  ...sort(Object.keys(TorrentFilterStore.taxonomy.tagCounts)).asc(),
                  ...selectedTags,
                ]),
              ].reduce((accumulator: Array<ReactElement>, tag) => {
                if (tag === '') {
                  return accumulator;
                }

                accumulator.push(
                  <SelectItem
                    id={tag}
                    key={tag}
                    isSelected={selectedTags.includes(tag)}
                    onClick={() => {
                      if (tag === 'untagged') {
                        setSelectedTags([]);
                      } else if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((key) => key !== tag && key !== ''));
                      } else {
                        setSelectedTags([...selectedTags.filter((key) => key !== ''), tag]);
                      }
                    }}
                  >
                    {tag === 'untagged' ? <Trans id="filter.untagged" /> : tag}
                  </SelectItem>,
                );
                return accumulator;
              }, [])}
            </ContextMenu>
          </Portal>
        </Textbox>
      </div>
    </FormRowItem>
  );
};

TagSelect.defaultProps = {
  id: 'tags',
  label: undefined,
  defaultValue: undefined,
  placeholder: undefined,
  onTagSelected: undefined,
};

export default TagSelect;
