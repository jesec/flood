import {TorrentHealth} from '../types/Torrent';

/**
 * Calculates torrent health based on the number of seeders.
 *
 * Health levels:
 * - CRITICAL (0): No seeders available
 * - POOR (1): 1-2 seeders
 * - FAIR (2): 3-5 seeders
 * - GOOD (3): 6-10 seeders
 * - EXCELLENT (4): More than 10 seeders
 *
 * @param seedsConnected - Number of connected seeders
 * @param seedsTotal - Total number of seeders in swarm
 * @returns TorrentHealth enum value
 */
export const calculateTorrentHealth = (seedsConnected: number, seedsTotal: number): TorrentHealth => {
  // Use the higher of connected or total seeds for health calculation
  // since total represents potential availability
  const seeds = Math.max(seedsConnected, seedsTotal);

  if (seeds === 0) {
    return TorrentHealth.CRITICAL;
  }
  if (seeds <= 2) {
    return TorrentHealth.POOR;
  }
  if (seeds <= 5) {
    return TorrentHealth.FAIR;
  }
  if (seeds <= 10) {
    return TorrentHealth.GOOD;
  }
  return TorrentHealth.EXCELLENT;
};

/**
 * Returns a human-readable label for the health level
 */
export const getHealthLabel = (health: TorrentHealth): string => {
  switch (health) {
    case TorrentHealth.CRITICAL:
      return 'Critical';
    case TorrentHealth.POOR:
      return 'Poor';
    case TorrentHealth.FAIR:
      return 'Fair';
    case TorrentHealth.GOOD:
      return 'Good';
    case TorrentHealth.EXCELLENT:
      return 'Excellent';
    default:
      return 'Unknown';
  }
};
