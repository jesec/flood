import classnames from 'classnames';
import {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {useLingui} from '@lingui/react';

import {TorrentHealth} from '@shared/types/Torrent';

interface HealthIndicatorProps {
  health: TorrentHealth;
}

const HEALTH_LABELS: Record<TorrentHealth, string> = {
  [TorrentHealth.CRITICAL]: 'torrents.properties.health.critical',
  [TorrentHealth.POOR]: 'torrents.properties.health.poor',
  [TorrentHealth.FAIR]: 'torrents.properties.health.fair',
  [TorrentHealth.GOOD]: 'torrents.properties.health.good',
  [TorrentHealth.EXCELLENT]: 'torrents.properties.health.excellent',
};

const HEALTH_COLORS: Record<TorrentHealth, string> = {
  [TorrentHealth.CRITICAL]: 'health-indicator--critical',
  [TorrentHealth.POOR]: 'health-indicator--poor',
  [TorrentHealth.FAIR]: 'health-indicator--fair',
  [TorrentHealth.GOOD]: 'health-indicator--good',
  [TorrentHealth.EXCELLENT]: 'health-indicator--excellent',
};

const HealthIndicator: FC<HealthIndicatorProps> = observer(({health}: HealthIndicatorProps) => {
  const {i18n} = useLingui();
  const label = i18n._(HEALTH_LABELS[health]);

  return (
    <div className={classnames('health-indicator', HEALTH_COLORS[health])}>
      <span className="health-indicator__label">{label}</span>
    </div>
  );
});

export default HealthIndicator;
