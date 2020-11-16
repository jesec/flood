import classnames from 'classnames';
import {FC, ReactNode, ReactNodeArray, useEffect, useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {useKeyPressEvent} from 'react-use';

import type {TorrentProperties} from '@shared/types/Torrent';

import {ContextMenu, FormElementAddon, FormRowItem, Portal, SelectItem, Textbox} from '../../../ui';
import Chevron from '../../../ui/icons/Chevron';
import SettingStore from '../../../stores/SettingStore';
import TorrentFilterStore from '../../../stores/TorrentFilterStore';

interface TagSelectProps {
  id?: string;
  label?: ReactNode;
  defaultValue?: TorrentProperties['tags'];
  placeholder?: string;
}

const TagSelect: FC<TagSelectProps> = ({defaultValue, placeholder, id, label}: TagSelectProps) => {
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
      if (!formRowRef.current?.contains((e.target as unknown) as Node)) {
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
  }, [selectedTags]);

  return (
    <FormRowItem ref={formRowRef}>
      <label className="form__element__label">{label}</label>
      <div className={classes}>
        <Textbox
          id={id || 'tags'}
          addonPlacement="after"
          defaultValue={defaultValue}
          placeholder={placeholder}
          ref={textboxRef}>
          <FormElementAddon
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className="select__indicator">
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
              triggerRef={textboxRef}>
              {Object.keys(TorrentFilterStore.taxonomy.tagCounts).reduce((accumulator: ReactNodeArray, tag) => {
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
                        setSelectedTags(selectedTags.filter((key) => key !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}>
                    {tag === 'untagged' ? <FormattedMessage id="filter.untagged" /> : tag}
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
};

export default TagSelect;
