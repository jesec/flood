import {FormattedMessage} from 'react-intl';
import React from 'react';

export default class Duration extends React.Component {
  render() {
    let {suffix = null} = this.props;
    const {value: duration} = this.props;

    if (duration == null) {
      return null;
    }

    let content = null;

    if (suffix) {
      suffix = <span className="duration--segment">{suffix}</span>;
    }

    if (duration === 'Infinity') {
      content = <FormattedMessage id="unit.time.infinity" defaultMessage="∞" />;
    } else if (duration.years > 0) {
      content = [
        <span className="duration--segment" key="years">
          {duration.years}
          <em className="unit">
            <FormattedMessage id="unit.time.year" defaultMessage="yr" />
          </em>
        </span>,
        <span className="duration--segment" key="weeks">
          {duration.weeks}
          <em className="unit">
            <FormattedMessage id="unit.time.week" defaultMessage="wk" />
          </em>
        </span>,
      ];
    } else if (duration.weeks > 0) {
      content = [
        <span className="duration--segment" key="weeks">
          {duration.weeks}
          <em className="unit">
            <FormattedMessage id="unit.time.week" defaultMessage="wk" />
          </em>
        </span>,
        <span className="duration--segment" key="days">
          {duration.days}
          <em className="unit">
            <FormattedMessage id="unit.time.day" defaultMessage="d" />
          </em>
        </span>,
      ];
    } else if (duration.days > 0) {
      content = [
        <span className="duration--segment" key="days">
          {duration.days}
          <em className="unit">
            <FormattedMessage id="unit.time.day" defaultMessage="d" />
          </em>
        </span>,
        <span className="duration--segment" key="hours">
          {duration.hours}
          <em className="unit">
            <FormattedMessage id="unit.time.hour" defaultMessage="hr" />
          </em>
        </span>,
      ];
    } else if (duration.hours > 0) {
      content = [
        <span className="duration--segment" key="hours">
          {duration.hours}
          <em className="unit">
            <FormattedMessage id="unit.time.hour" defaultMessage="hr" />
          </em>
        </span>,
        <span className="duration--segment" key="minutes">
          {duration.minutes}
          <em className="unit">
            <FormattedMessage id="unit.time.minute" defaultMessage="m" />
          </em>
        </span>,
      ];
    } else if (duration.minutes > 0) {
      content = [
        <span className="duration--segment" key="minutes">
          {duration.minutes}
          <em className="unit">
            <FormattedMessage id="unit.time.minute" defaultMessage="m" />
          </em>
        </span>,
        <span className="duration--segment" key="seconds">
          {duration.seconds}
          <em className="unit">
            <FormattedMessage id="unit.time.second" defaultMessage="s" />
          </em>
        </span>,
      ];
    } else {
      content = (
        <span className="duration--segment">
          {duration.seconds}
          <em className="unit">
            <FormattedMessage id="unit.time.second" defaultMessage="s" />
          </em>
        </span>
      );
    }

    return (
      <span className="duration">
        {content}
        {suffix}
      </span>
    );
  }
}
