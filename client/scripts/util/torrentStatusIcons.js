import React from 'react';

import ErrorIcon from '../components/icons/ErrorIcon';
import PauseIcon from '../components/icons/PauseIcon';
import propsMap from '../../../shared/constants/propsMap';
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
    hashChecking: [status.indexOf(propsMap.clientStatus.checking) > -1],
    error: [status.indexOf(propsMap.clientStatus.error) > -1],
    paused: [status.indexOf(propsMap.clientStatus.paused) > -1],
    stopped: [status.indexOf(propsMap.clientStatus.stopped) > -1],
    running: [
      status.indexOf(propsMap.clientStatus.downloading) > -1,
      status.indexOf(propsMap.clientStatus.seeding) > -1
    ]
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
