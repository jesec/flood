import {FormattedMessage} from 'react-intl';
import * as React from 'react';

import formatUtil from '@shared/util/formatUtil';

interface DurationProps {
  suffix?: React.ReactNode;
  value: number;
}

const Duration: React.FC<DurationProps> = (props: DurationProps) => {
  const {suffix, value} = props;

  if (value == null) {
    return null;
  }

  let content = null;
  let suffixElement = null;

  if (suffix) {
    suffixElement = <span className="duration--segment">{suffix}</span>;
  }

  const duration = value === -1 ? -1 : formatUtil.secondsToDuration(value);

  if (duration === -1) {
    content = <FormattedMessage id="unit.time.infinity" />;
  } else if (duration.years != null && duration.years > 0) {
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
  } else if (duration.weeks != null && duration.weeks > 0) {
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
  } else if (duration.days != null && duration.days > 0) {
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
  } else if (duration.hours != null && duration.hours > 0) {
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
  } else if (duration.minutes != null && duration.minutes > 0) {
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
      {suffixElement}
    </span>
  );
};

Duration.defaultProps = {
  suffix: undefined,
};

export default Duration;
