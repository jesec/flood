import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Checkbox} from '../../../../ui';
import ErrorIcon from '../../../icons/ErrorIcon';
import SettingsStore from '../../../../stores/SettingsStore';
import SortableList from '../../../general/SortableList';
import Tooltip from '../../../general/Tooltip';
import TorrentProperties from '../../../../constants/TorrentProperties';

class TorrentDetailItemsList extends React.Component {
  tooltipRef = null;

  constructor(props) {
    super(props);

    this.state = {
      torrentDetails: SettingsStore.getFloodSetting('torrentDetails'),
    };
  }

  getLockedIDs() {
    if (this.props.torrentListViewSize === 'expanded') {
      return ['name', 'eta', 'downloadRate', 'uploadRate'];
    }

    return [];
  }

  handleCheckboxValueChange = (id, value) => {
    let {torrentDetails} = this.state;

    torrentDetails = torrentDetails.map((detail) => {
      if (detail.id === id) {
        detail.visible = value;
      }

      return detail;
    });

    this.props.onSettingsChange({torrentDetails});
    this.setState({torrentDetails});
  };

  handleMouseDown = () => {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }
  };

  handleMove = (items) => {
    this.setState({torrentDetails: items});
    this.props.onSettingsChange({torrentDetails: items});
  };

  renderItem = (item, index) => {
    const {id, visible} = item;
    let checkbox = null;
    let warning = null;

    if (!item.dragIndicator && !this.getLockedIDs().includes(id)) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox
            checked={visible}
            onChange={(event) => this.handleCheckboxValueChange(id, event.target.checked)}
            modifier="dark">
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
          scrollContainer={this.props.scrollContainer}
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

    if (item.dragIndicator) {
      return <div className="sortable-list__item">{content}</div>;
    }

    return content;
  };

  render() {
    const lockedIDs = this.getLockedIDs();
    let torrentDetailItems = this.state.torrentDetails
      .slice()
      .filter((property) => Object.prototype.hasOwnProperty.call(TorrentProperties, property.id));

    if (this.props.torrentListViewSize === 'expanded') {
      let nextUnlockedIndex = lockedIDs.length;

      torrentDetailItems = torrentDetailItems
        .reduce((accumulator, detail) => {
          const lockedIDIndex = lockedIDs.indexOf(detail.id);

          if (lockedIDIndex > -1) {
            accumulator[lockedIDIndex] = detail;
          } else {
            accumulator[nextUnlockedIndex++] = detail;
          }

          return accumulator;
        }, [])
        .filter((item) => item != null);
    }

    return (
      <SortableList
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
