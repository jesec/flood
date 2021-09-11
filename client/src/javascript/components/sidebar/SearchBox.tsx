import classnames from 'classnames';
import {FC, useEffect, useRef} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import {Close, Search} from '@client/ui/icons';
import TorrentFilterStore from '@client/stores/TorrentFilterStore';
import UIActions from '@client/actions/UIActions';

const SearchBox: FC = observer(() => {
  const {i18n} = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);

  const {searchFilter} = TorrentFilterStore.filters;

  useEffect(() => {
    if (inputRef.current != null) {
      if (searchFilter !== inputRef.current.value) {
        inputRef.current.value = searchFilter;
      }
    }
  }, [inputRef, searchFilter]);

  const isSearchActive = searchFilter !== '';

  return (
    <div
      className={classnames({
        sidebar__item: true, // eslint-disable-line
        search: true,
        'is-in-use': isSearchActive,
      })}
    >
      {isSearchActive && (
        <button
          className="button search__reset-button"
          onClick={() => {
            UIActions.setTorrentsSearchFilter('');
            if (inputRef.current != null) {
              inputRef.current.blur();
            }
          }}
          type="button"
        >
          <Close />
        </button>
      )}
      <Search />
      <input
        className="textbox"
        ref={inputRef}
        type="text"
        placeholder={i18n._('sidebar.search.placeholder')}
        onChange={(event) => {
          UIActions.setTorrentsSearchFilter(event.target.value);
        }}
      />
    </div>
  );
});

export default SearchBox;
