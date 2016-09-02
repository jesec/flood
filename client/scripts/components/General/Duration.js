import {FormattedMessage} from 'react-intl';
import React from 'react';

export default class Duration extends React.Component {
  render() {
    let duration = this.props.value;

    if (duration === 'Infinity') {
      return (
        <FormattedMessage id="unit.time.infinity" defaultMessage="∞" />
      );
    } else if (duration.years > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {duration.years}<em className="unit"><FormattedMessage id="unit.time.year" defaultMessage="yr" /></em>
          </span>
          <span className="torrent__details--segment">
            {duration.weeks}<em className="unit"><FormattedMessage id="unit.time.week" defaultMessage="wk" /></em>
          </span>
        </span>
      );
    } else if (duration.weeks > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {duration.weeks}<em className="unit"><FormattedMessage id="unit.time.week" defaultMessage="wk" /></em>
          </span>
          <span className="torrent__details--segment">
            {duration.days}<em className="unit"><FormattedMessage id="unit.time.day" defaultMessage="d" /></em>
          </span>
        </span>
      );
    } else if (duration.days > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {duration.days}<em className="unit"><FormattedMessage id="unit.time.day" defaultMessage="d" /></em>
          </span>
          <span className="torrent__details--segment">
            {duration.hours}<em className="unit"><FormattedMessage id="unit.time.hour" defaultMessage="hr" /></em>
          </span>
        </span>
      );
    } else if (duration.hours > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {duration.hours}<em className="unit"><FormattedMessage id="unit.time.hour" defaultMessage="hr" /></em>
          </span>
          <span className="torrent__details--segment">
            {duration.minutes}<em className="unit"><FormattedMessage id="unit.time.minute" defaultMessage="m" /></em>
          </span>
        </span>
      );
    } else if (duration.minutes > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {duration.minutes}<em className="unit"><FormattedMessage id="unit.time.minute" defaultMessage="m" /></em>
          </span>
          <span className="torrent__details--segment">
            {duration.seconds}<em className="unit"><FormattedMessage id="unit.time.second" defaultMessage="s" /></em>
          </span>
        </span>
      );
    } else {
      return (
        <span>
          {duration.seconds}<em className="unit"><FormattedMessage id="unit.time.second" defaultMessage="s" /></em>
        </span>
      );
    }
  }
}
