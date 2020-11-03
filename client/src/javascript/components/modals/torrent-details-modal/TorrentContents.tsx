import {observable, runInAction} from 'mobx';
import classnames from 'classnames';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {observer} from 'mobx-react';
import * as React from 'react';

import type {TorrentContent, TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';

import {Button, Checkbox, Form, FormRow, FormRowItem, Select, SelectItem} from '../../../ui';
import ConfigStore from '../../../stores/ConfigStore';
import Disk from '../../icons/Disk';
import DirectoryTree from '../../general/filesystem/DirectoryTree';
import selectionTree from '../../../util/selectionTree';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentStore from '../../../stores/TorrentStore';
import UIStore from '../../../stores/UIStore';

@observer
class TorrentContents extends React.Component<WrappedComponentProps> {
  contents = observable.array<TorrentContent>([]);
  itemsTree = observable.object<TorrentContentSelectionTree>({});
  selectedIndices = observable.array<number>([]);
  polling = setInterval(() => {
    // TODO: itemsTree is not regenerated as that would override user's selection.
    // As a result, percentage of contents of an active torrent is not updated.
    // this.fetchTorrentContents();
  }, ConfigStore.pollInterval);

  constructor(props: WrappedComponentProps) {
    super(props);

    this.fetchTorrentContents(true);
  }

  componentWillUnmount() {
    clearInterval(this.polling);
  }

  fetchTorrentContents = (populateTree = false) => {
    if (UIStore.activeModal?.id === 'torrent-details') {
      TorrentActions.fetchTorrentContents(UIStore.activeModal?.hash).then((contents) => {
        if (contents != null) {
          runInAction(() => {
            this.contents.replace(contents);
            if (populateTree) {
              this.itemsTree = selectionTree.getSelectionTree(this.contents);
            }
          });
        }
      });
    }
  };

  handleDownloadButtonClick = (hash: string, event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    const {baseURI} = ConfigStore;
    const link = document.createElement('a');

    link.download = '';
    link.href = `${baseURI}api/torrents/${hash}/contents/${this.selectedIndices.join(',')}/data`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  handleFormChange = (hash: string, {event}: {event: Event | React.FormEvent<HTMLFormElement>}): void => {
    if (event.target != null && (event.target as HTMLInputElement).name === 'file-priority') {
      const inputElement = event.target as HTMLInputElement;
      if (inputElement.name === 'file-priority') {
        TorrentActions.setFilePriority(hash, {
          indices: this.selectedIndices,
          priority: Number(inputElement.value),
        });
      }
    }
  };

  handleItemSelect = (selectedItem: TorrentContentSelection) => {
    runInAction(() => {
      this.itemsTree = selectionTree.applySelection(this.itemsTree, selectedItem);
      this.selectedIndices.replace(selectionTree.getSelectedItems(this.itemsTree));
    });
  };

  handleSelectAllClick = () => {
    runInAction(() => {
      this.itemsTree = selectionTree.getSelectionTree(
        this.contents,
        this.selectedIndices.length < this.contents.length,
      );
      this.selectedIndices.replace(selectionTree.getSelectedItems(this.itemsTree));
    });
  };

  render() {
    if (UIStore.activeModal?.id !== 'torrent-details') {
      return null;
    }

    const {hash} = UIStore?.activeModal;

    let directoryHeadingIconContent = null;
    let fileDetailContent = null;

    let allSelected = false;
    if (this.contents?.length > 0) {
      allSelected = this.selectedIndices.length >= this.contents.length;
      directoryHeadingIconContent = (
        <div className="file__checkbox directory-tree__checkbox">
          <div
            className="directory-tree__checkbox__item
            directory-tree__checkbox__item--checkbox">
            <FormRow>
              <Checkbox checked={allSelected} onChange={this.handleSelectAllClick} useProps />
            </FormRow>
          </div>
          <div
            className="directory-tree__checkbox__item
            directory-tree__checkbox__item--icon">
            <Disk />
          </div>
        </div>
      );
      fileDetailContent = (
        <DirectoryTree depth={0} onItemSelect={this.handleItemSelect} hash={hash} itemsTree={this.itemsTree} />
      );
    } else {
      directoryHeadingIconContent = <Disk />;
      fileDetailContent = (
        <div className="directory-tree__node directory-tree__node--file">
          <FormattedMessage id="torrents.details.files.loading" />
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
      'directory-tree__wrapper--toolbar-visible': this.selectedIndices.length > 0,
    });

    return (
      <Form className={wrapperClasses} onChange={(e) => this.handleFormChange(hash, e)}>
        <div className="directory-tree__selection-toolbar">
          <FormRow align="center">
            <FormRowItem width="one-quarter" grow={false} shrink={false}>
              <FormattedMessage
                id="torrents.details.selected.files"
                values={{
                  count: this.selectedIndices.length,
                  countElement: (
                    <span className="directory-tree__selection-toolbar__item-count">{this.selectedIndices.length}</span>
                  ),
                }}
              />
            </FormRowItem>
            <Button onClick={(e) => this.handleDownloadButtonClick(hash, e)} grow={false} shrink={false}>
              <FormattedMessage
                id="torrents.details.files.download.file"
                values={{
                  count: this.selectedIndices.length,
                }}
              />
            </Button>
            <Select id="file-priority" persistentPlaceholder shrink={false} defaultID="">
              <SelectItem placeholder>
                <FormattedMessage id="torrents.details.selected.files.set.priority" />
              </SelectItem>
              <SelectItem id={0}>
                {this.props.intl.formatMessage({
                  id: 'priority.dont.download',
                })}
              </SelectItem>
              <SelectItem id={1}>
                {this.props.intl.formatMessage({
                  id: 'priority.normal',
                })}
              </SelectItem>
              <SelectItem id={2}>
                {this.props.intl.formatMessage({
                  id: 'priority.high',
                })}
              </SelectItem>
            </Select>
          </FormRow>
        </div>
        <div className="directory-tree torrent-details__section torrent-details__section--file-tree modal__content--nested-scroll__content">
          {directoryHeading}
          {fileDetailContent}
        </div>
      </Form>
    );
  }
}

export default injectIntl(TorrentContents);
