import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {FloodSettings} from '@shared/types/FloodSettings';

import {Checkbox} from '../../../../ui';
import ErrorIcon from '../../../icons/ErrorIcon';
import SettingsStore from '../../../../stores/SettingsStore';
import SortableList, {ListItem} from '../../../general/SortableList';
import Tooltip from '../../../general/Tooltip';
import TorrentProperties from '../../../../constants/TorrentProperties';

interface TorrentDetailItemsListProps {
  torrentListViewSize: FloodSettings['torrentListViewSize'];
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

interface TorrentDetailItemsListStates {
  torrentDetails: FloodSettings['torrentDetails'];
}

class TorrentDetailItemsList extends React.Component<TorrentDetailItemsListProps, TorrentDetailItemsListStates> {
  tooltipRef: Tooltip | null = null;

  constructor(props: TorrentDetailItemsListProps) {
    super(props);

    this.state = {
      torrentDetails: SettingsStore.getFloodSetting('torrentDetails'),
    };
  }

  getLockedIDs(): Array<keyof typeof TorrentProperties> {
    if (this.props.torrentListViewSize === 'expanded') {
      return ['name', 'eta', 'downRate', 'upRate'];
    }

    return [];
  }

  handleCheckboxValueChange = (id: string, value: boolean): void => {
    let {torrentDetails} = this.state;

    torrentDetails = torrentDetails.map((detail) => {
      return {
        id: detail.id,
        visible: detail.id === id ? value : detail.visible,
      };
    });

    this.props.onSettingsChange({torrentDetails});
    this.setState({torrentDetails});
  };

  handleMouseDown = (): void => {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }
  };

  handleMove = (items: Array<ListItem>): void => {
    this.setState({torrentDetails: items as FloodSettings['torrentDetails']});
    this.props.onSettingsChange({torrentDetails: items as FloodSettings['torrentDetails']});
  };

  renderItem = (item: ListItem, index: number): React.ReactNode => {
    const {id, visible} = item as FloodSettings['torrentDetails'][number];
    let checkbox = null;
    let warning = null;

    if (!this.getLockedIDs().includes(id)) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox
            checked={visible}
            onChange={(event) => this.handleCheckboxValueChange(id, (event.target as HTMLInputElement).checked)}>
            <FormattedMessage id="settings.ui.torrent.details.enabled" />
          </Checkbox>
        </span>
      );
    }

    if (
      id === 'tags' &&
      this.props.torrentListViewSize === 'expanded' &&
      index < this.state.torrentDetails.length - 1
    ) {
      const tooltipContent = <FormattedMessage id="settings.ui.torrent.details.tags.placement" />;

      warning = (
        <Tooltip
          className="tooltip tooltip--is-error"
          content={tooltipContent}
          offset={-5}
          ref={(ref) => {
            this.tooltipRef = ref;
          }}
          width={200}
          wrapperClassName="sortable-list__content sortable-list__content--secondary tooltip__wrapper"
          wrapText>
          <ErrorIcon />
        </Tooltip>
      );
    }

    const content = (
      <div className="sortable-list__content sortable-list__content__wrapper">
        {warning}
        <span className="sortable-list__content sortable-list__content--primary">
          <FormattedMessage id={TorrentProperties[id].id} />
        </span>
        {checkbox}
      </div>
    );

    return content;
  };

  render(): React.ReactNode {
    const lockedIDs = this.getLockedIDs();
    let torrentDetailItems = this.state.torrentDetails
      .slice()
      .filter((property) => Object.prototype.hasOwnProperty.call(TorrentProperties, property.id));

    if (this.props.torrentListViewSize === 'expanded') {
      let nextUnlockedIndex = lockedIDs.length;

      torrentDetailItems = torrentDetailItems
        .reduce((accumulator: FloodSettings['torrentDetails'], detail) => {
          const lockedIDIndex = lockedIDs.indexOf(detail.id);

          if (lockedIDIndex > -1) {
            accumulator[lockedIDIndex] = detail;
          } else {
            accumulator[nextUnlockedIndex] = detail;
            nextUnlockedIndex += 1;
          }

          return accumulator;
        }, [])
        .filter((item) => item != null);
    }

    return (
      <SortableList
        id="torrent-details"
        className="sortable-list--torrent-details"
        items={torrentDetailItems}
        lockedIDs={lockedIDs}
        onMouseDown={this.handleMouseDown}
        onDrop={this.handleMove}
        renderItem={this.renderItem}
      />
    );
  }
}

export default TorrentDetailItemsList;
