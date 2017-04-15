import React from 'react';

import ErrorIcon from '../components/icons/ErrorIcon';
import PauseIcon from '../components/icons/PauseIcon';
import torrentStatusMap from '../../../shared/constants/torrentStatusMap';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import StartIcon from '../components/icons/StartIcon';
import StopIcon from '../components/icons/StopIcon';

const STATUS_ICON_MAP = {
  error: <ErrorIcon />,
  hashChecking: <SpinnerIcon />,
  stopped: <StopIcon />,
  paused: <PauseIcon />,
  running: <StartIcon />
};

export function torrentStatusIcons(status) {
  let statusString;
  let statusConditions = {
    hashChecking: [status.includes(torrentStatusMap.checking)],
    error: [status.includes(torrentStatusMap.error)],
    paused: [status.includes(torrentStatusMap.paused)],
    stopped: [status.includes(torrentStatusMap.stopped)],
    running: [status.includes(torrentStatusMap.downloading),
      status.includes(torrentStatusMap.seeding)]
  };

  Object.keys(statusConditions).some((status) => {
    let conditions = statusConditions[status];

    conditions.some((condition) => {
      if (condition) {
        statusString = status;
      }

      return condition;
    });

    return statusString != null;
  });

  return STATUS_ICON_MAP[statusString];
}
