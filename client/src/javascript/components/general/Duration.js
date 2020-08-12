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
      content = <FormattedMessage id="unit.time.infinity" />;
    } else if (duration.years > 0) {
      content = [
        <span className="duration--segment" key="years">
          {duration.years}
          <em className="unit">
            <FormattedMessage id="unit.time.year" />
          </em>
        </span>,
        <span className="duration--segment" key="weeks">
          {duration.weeks}
          <em className="unit">
            <FormattedMessage id="unit.time.week" />
          </em>
        </span>,
      ];
    } else if (duration.weeks > 0) {
      content = [
        <span className="duration--segment" key="weeks">
          {duration.weeks}
          <em className="unit">
            <FormattedMessage id="unit.time.week" />
          </em>
        </span>,
        <span className="duration--segment" key="days">
          {duration.days}
          <em className="unit">
            <FormattedMessage id="unit.time.day" />
          </em>
        </span>,
      ];
    } else if (duration.days > 0) {
      content = [
        <span className="duration--segment" key="days">
          {duration.days}
          <em className="unit">
            <FormattedMessage id="unit.time.day" />
          </em>
        </span>,
        <span className="duration--segment" key="hours">
          {duration.hours}
          <em className="unit">
            <FormattedMessage id="unit.time.hour" />
          </em>
        </span>,
      ];
    } else if (duration.hours > 0) {
      content = [
        <span className="duration--segment" key="hours">
          {duration.hours}
          <em className="unit">
            <FormattedMessage id="unit.time.hour" />
          </em>
        </span>,
        <span className="duration--segment" key="minutes">
          {duration.minutes}
          <em className="unit">
            <FormattedMessage id="unit.time.minute" />
          </em>
        </span>,
      ];
    } else if (duration.minutes > 0) {
      content = [
        <span className="duration--segment" key="minutes">
          {duration.minutes}
          <em className="unit">
            <FormattedMessage id="unit.time.minute" />
          </em>
        </span>,
        <span className="duration--segment" key="seconds">
          {duration.seconds}
          <em className="unit">
            <FormattedMessage id="unit.time.second" />
          </em>
        </span>,
      ];
    } else {
      content = (
        <span className="duration--segment">
          {duration.seconds}
          <em className="unit">
            <FormattedMessage id="unit.time.second" />
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
