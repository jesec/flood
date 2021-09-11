import classnames from 'classnames';
import {observer} from 'mobx-react';
import {FC, useEffect, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Button, Checkbox, Form, FormRow, FormRowItem, Select, SelectItem} from '@client/ui';
import ConfigStore from '@client/stores/ConfigStore';
import {Disk} from '@client/ui/icons';
import selectionTree from '@client/util/selectionTree';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import type {TorrentContent, TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';

import DirectoryTree from '../../general/filesystem/DirectoryTree';

const TorrentContents: FC = observer(() => {
  const [contents, setContents] = useState<TorrentContent[]>([]);
  const [itemsTree, setItemsTree] = useState<TorrentContentSelectionTree>({});
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const {i18n} = useLingui();

  useEffect(() => {
    if (UIStore.activeModal?.id === 'torrent-details') {
      TorrentActions.fetchTorrentContents(UIStore.activeModal?.hash).then((fetchedContents) => {
        if (fetchedContents != null) {
          setContents(fetchedContents);
          setItemsTree(selectionTree.getSelectionTree(fetchedContents));
        }
      });
    }
  }, []);

  if (UIStore.activeModal?.id !== 'torrent-details') {
    return null;
  }

  const {hash} = UIStore?.activeModal;

  let directoryHeadingIconContent = null;
  let fileDetailContent = null;

  let allSelected = false;
  if (contents?.length > 0) {
    allSelected = selectedIndices.length >= contents.length;
    directoryHeadingIconContent = (
      <div className="file__checkbox directory-tree__checkbox">
        <div
          className="directory-tree__checkbox__item
            directory-tree__checkbox__item--checkbox"
        >
          <FormRow>
            <Checkbox
              checked={allSelected}
              id="select-all"
              onClick={() => {
                // select or deselect all
                const newItemsTree = selectionTree.getSelectionTree(contents, selectedIndices.length < contents.length);

                setItemsTree(newItemsTree);
                setSelectedIndices(selectionTree.getSelectedItems(newItemsTree));
              }}
            />
          </FormRow>
        </div>
        <div
          className="directory-tree__checkbox__item
            directory-tree__checkbox__item--icon"
        >
          <Disk />
        </div>
      </div>
    );
    fileDetailContent = (
      <DirectoryTree
        depth={0}
        onItemSelect={(selectedItem: TorrentContentSelection) => {
          const newItemsTree = selectionTree.applySelection(itemsTree, selectedItem);
          setItemsTree(newItemsTree);
          setSelectedIndices(selectionTree.getSelectedItems(newItemsTree));
        }}
        hash={hash}
        path={[]}
        itemsTree={itemsTree}
      />
    );
  } else {
    directoryHeadingIconContent = <Disk />;
    fileDetailContent = (
      <div className="directory-tree__node directory-tree__node--file">
        <Trans id="torrents.details.files.loading" />
      </div>
    );
  }

  const directoryHeadingClasses = classnames(
    'directory-tree__node',
    'directory-tree__parent-directory torrent-details__section__heading',
    {
      'directory-tree__node--selected': allSelected,
    },
  );

  const directoryHeading = (
    <div className={directoryHeadingClasses}>
      <div className="file__label">
        {directoryHeadingIconContent}
        <div className="file__name">{TorrentStore.torrents?.[hash].directory}</div>
      </div>
    </div>
  );

  const wrapperClasses = classnames('inverse directory-tree__wrapper', {
    'directory-tree__wrapper--toolbar-visible': selectedIndices.length > 0,
  });

  return (
    <Form
      className={wrapperClasses}
      onChange={({event}) => {
        if (event.target != null && (event.target as HTMLInputElement).name === 'file-priority') {
          const inputElement = event.target as HTMLInputElement;
          if (inputElement.value) {
            TorrentActions.setFilePriority(hash, {
              indices: selectedIndices,
              priority: Number(inputElement.value),
            });
          }
        }
      }}
    >
      <div className="directory-tree__selection-toolbar">
        <FormRow align="center">
          <FormRowItem width="one-quarter" grow={false} shrink={false}>
            <Trans
              id="torrents.details.selected.files"
              values={{
                count: selectedIndices.length,
                countElement: (
                  <span className="directory-tree__selection-toolbar__item-count">{selectedIndices.length}</span>
                ),
              }}
            />
          </FormRowItem>
          <Button
            onClick={(event) => {
              event.preventDefault();
              const {baseURI} = ConfigStore;
              const link = document.createElement('a');

              link.download = '';
              link.href = `${baseURI}api/torrents/${hash}/contents/${selectedIndices.join(',')}/data`;
              link.style.display = 'none';

              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            grow={false}
            shrink={false}
          >
            <Trans
              id="torrents.details.files.download.file"
              values={{
                count: selectedIndices.length,
              }}
            />
          </Button>
          <Select id="file-priority" persistentPlaceholder shrink={false} defaultID="">
            <SelectItem id={-1} isPlaceholder>
              <Trans id="torrents.details.selected.files.set.priority" />
            </SelectItem>
            <SelectItem id={0}>{i18n._('priority.dont.download')}</SelectItem>
            <SelectItem id={1}>{i18n._('priority.normal')}</SelectItem>
            <SelectItem id={2}>{i18n._('priority.high')}</SelectItem>
          </Select>
        </FormRow>
      </div>
      <div className="directory-tree torrent-details__section torrent-details__section--file-tree modal__content--nested-scroll__content">
        {directoryHeading}
        {fileDetailContent}
      </div>
    </Form>
  );
});

export default TorrentContents;
