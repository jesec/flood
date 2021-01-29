import {FC, ReactNode} from 'react';
import {Trans} from '@lingui/react';

const secondsToDuration = (
  cumSeconds: number,
): {
  years?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  cumSeconds: number;
} => {
  const years = Math.floor(cumSeconds / 31536000);
  const weeks = Math.floor((cumSeconds % 31536000) / 604800);
  const days = Math.floor(((cumSeconds % 31536000) % 604800) / 86400);
  const hours = Math.floor((((cumSeconds % 31536000) % 604800) % 86400) / 3600);
  const minutes = Math.floor(((((cumSeconds % 31536000) % 604800) % 86400) % 3600) / 60);
  const seconds = Math.floor(cumSeconds - minutes * 60);
  let timeRemaining = null;

  if (years > 0) {
    timeRemaining = {years, weeks, cumSeconds};
  } else if (weeks > 0) {
    timeRemaining = {weeks, days, cumSeconds};
  } else if (days > 0) {
    timeRemaining = {days, hours, cumSeconds};
  } else if (hours > 0) {
    timeRemaining = {hours, minutes, cumSeconds};
  } else if (minutes > 0) {
    timeRemaining = {minutes, seconds, cumSeconds};
  } else {
    timeRemaining = {seconds, cumSeconds};
  }

  return timeRemaining;
};

interface DurationProps {
  suffix?: ReactNode;
  value: number;
}

const Duration: FC<DurationProps> = (props: DurationProps) => {
  const {suffix, value} = props;

  if (value == null) {
    return null;
  }

  let content = null;
  let suffixElement = null;

  if (suffix) {
    suffixElement = <span className="duration--segment">{suffix}</span>;
  }

  const duration = value === -1 ? -1 : secondsToDuration(value);

  if (duration === -1) {
    content = <Trans id="unit.time.infinity" />;
  } else if (duration.years != null && duration.years > 0) {
    content = [
      <span className="duration--segment" key="years">
        {duration.years}
        <em className="unit">
          <Trans id="unit.time.year" />
        </em>
      </span>,
      <span className="duration--segment" key="weeks">
        {duration.weeks}
        <em className="unit">
          <Trans id="unit.time.week" />
        </em>
      </span>,
    ];
  } else if (duration.weeks != null && duration.weeks > 0) {
    content = [
      <span className="duration--segment" key="weeks">
        {duration.weeks}
        <em className="unit">
          <Trans id="unit.time.week" />
        </em>
      </span>,
      <span className="duration--segment" key="days">
        {duration.days}
        <em className="unit">
          <Trans id="unit.time.day" />
        </em>
      </span>,
    ];
  } else if (duration.days != null && duration.days > 0) {
    content = [
      <span className="duration--segment" key="days">
        {duration.days}
        <em className="unit">
          <Trans id="unit.time.day" />
        </em>
      </span>,
      <span className="duration--segment" key="hours">
        {duration.hours}
        <em className="unit">
          <Trans id="unit.time.hour" />
        </em>
      </span>,
    ];
  } else if (duration.hours != null && duration.hours > 0) {
    content = [
      <span className="duration--segment" key="hours">
        {duration.hours}
        <em className="unit">
          <Trans id="unit.time.hour" />
        </em>
      </span>,
      <span className="duration--segment" key="minutes">
        {duration.minutes}
        <em className="unit">
          <Trans id="unit.time.minute" />
        </em>
      </span>,
    ];
  } else if (duration.minutes != null && duration.minutes > 0) {
    content = [
      <span className="duration--segment" key="minutes">
        {duration.minutes}
        <em className="unit">
          <Trans id="unit.time.minute" />
        </em>
      </span>,
      <span className="duration--segment" key="seconds">
        {duration.seconds}
        <em className="unit">
          <Trans id="unit.time.second" />
        </em>
      </span>,
    ];
  } else {
    content = (
      <span className="duration--segment">
        {duration.seconds}
        <em className="unit">
          <Trans id="unit.time.second" />
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
