export interface QBittorrentTransferInfo {
  // Global download rate (bytes/s)
  dl_info_speed: number;
  // Data downloaded this session (bytes)
  dl_info_data: number;
  // Global upload rate (bytes/s)
  up_info_speed: number;
  // Data uploaded this session (bytes)
  up_info_data: number;
  // Download rate limit (bytes/s)
  dl_rate_limit: number;
  // Upload rate limit (bytes/s)
  up_rate_limit: number;
  // DHT nodes connected to
  dht_nodes: number;
  // Connection status
  connection_status: 'connected' | 'firewalled' | 'disconnected';
}
