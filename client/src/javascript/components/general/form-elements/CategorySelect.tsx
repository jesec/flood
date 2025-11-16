import classnames from 'classnames';
import {FC, ReactElement, ReactNode, useEffect, useRef, useState} from 'react';
import {sort} from 'fast-sort';
import {Trans} from '@lingui/react';
import {useKeyPressEvent} from 'react-use';

import {ContextMenu, FormElementAddon, FormRowItem, Portal, SelectItem, Textbox} from '@client/ui';
import {Chevron} from '@client/ui/icons';
import TorrentFilterStore from '@client/stores/TorrentFilterStore';

import type {TorrentProperties} from '@shared/types/Torrent';

interface CategorySelectProps {
  id?: string;
  label?: ReactNode;
  defaultValue?: TorrentProperties['category'];
  placeholder?: string;
  onCategorySelected?: (categories: TorrentProperties['category']) => void;
}

const CategorySelect: FC<CategorySelectProps> = ({
  defaultValue,
  placeholder,
  id,
  label,
  onCategorySelected,
}: CategorySelectProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string>(defaultValue ?? '');
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
      textboxRef.current.value = selectedCategories;
    }
    if (onCategorySelected) {
      onCategorySelected(selectedCategories);
    }
  }, [selectedCategories, onCategorySelected]);

  return (
    <FormRowItem ref={formRowRef}>
      <div className={classes}>
        <Textbox
          autoComplete={isOpen ? 'off' : undefined}
          id={id || 'categories'}
          addonPlacement="after"
          defaultValue={defaultValue}
          label={label}
          onChange={() => {
            if (textboxRef.current != null) {
              setSelectedCategories(textboxRef.current.value.trim());
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
            <ContextMenu isIn={isOpen} overlayProps={{isInteractive: false}} ref={menuRef} triggerRef={textboxRef}>
              {[
                ...new Set(['uncategorized', ...sort(Object.keys(TorrentFilterStore.taxonomy.categoriesCounts)).asc()]),
              ].reduce((accumulator: Array<ReactElement>, category) => {
                if (category === '') {
                  return accumulator;
                }

                accumulator.push(
                  <SelectItem
                    id={category}
                    key={category}
                    isSelected={selectedCategories === category}
                    onClick={() => {
                      if (category === 'uncategorized') {
                        setSelectedCategories('');
                      } else {
                        setSelectedCategories(category);
                      }
                    }}
                  >
                    {category === 'uncategorized' ? <Trans id="filter.uncategorized" /> : category}
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

CategorySelect.defaultProps = {
  id: 'categories',
  label: undefined,
  defaultValue: undefined,
  placeholder: undefined,
  onCategorySelected: undefined,
};

export default CategorySelect;
