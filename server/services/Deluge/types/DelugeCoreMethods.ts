export enum DelugeCoreTorrentFilePriority {
  Skip = 0,
  Low = 1,
  Normal = 4,
  High = 7,
}

export interface DelugeCoreTorrentOptions {
  // Add the torrent in a paused state.
  add_paused: boolean;
  // Set torrent to auto managed mode, i.e. will be started or queued automatically.
  auto_managed: boolean;
  // The path for the torrent data to be stored while downloading.
  download_location: string;
  // The priority for files in torrent, range is [0..7] however only [0, 1, 4, 7] are normally used and correspond to [Skip, Low, Normal, High]
  file_priorities: DelugeCoreTorrentFilePriority[];
  // A mapping of the renamed filenames in 'index:filename' pairs.
  mapped_files: Record<number, string>;
  // Sets maximum number of connections this torrent will open. This must be at least 2. The default is unlimited (-1).
  max_connections: number;
  // Will limit the download bandwidth used by this torrent to the limit you set. The default is unlimited (-1) but will not exceed global limit.
  max_download_speed: number;
  // Sets the maximum number of peers that are unchoked at the same time on this torrent. This defaults to infinite (-1).
  max_upload_slots: number;
  // Will limit the upload bandwidth used by this torrent to the limit you set. The default is unlimited (-1) but will not exceed global limit.
  max_upload_speed: number;
  // Move the torrent when downloading has finished.
  move_completed: boolean;
  // The path to move torrent to when downloading has finished.
  move_completed_path: string;
  // The display name of the torrent.
  name: string;
  // The user this torrent belongs to.
  owner: string;
  // When adding the torrent should all files be pre-allocated.
  pre_allocate_storage: boolean;
  // Prioritize the first and last pieces in the torrent.
  prioritize_first_last_pieces: boolean;
  // Remove the torrent when it has reached the stop_ratio.
  remove_at_ratio: boolean;
  // Assume that all files are present for this torrent (Only used when adding a torrent).
  seed_mode: boolean;
  // Download the pieces of the torrent in order.
  sequential_download: boolean;
  // Enable the torrent to be seen by other Deluge users.
  shared: boolean;
  // Stop the torrent when it has reached stop_ratio.
  stop_at_ratio: boolean;
  // The seeding ratio to stop (or remove) the torrent at.
  stop_ratio: number;
  // Enable super seeding/initial seeding.
  super_seeding: boolean;
}

export interface DelugeCoreTorrentFile {
  index: number;
  offset: number;
  path: string;
  size: number;
}

export interface DelugeCoreTorrentPeer {
  client: string;
  country: string;
  down_speed: number;
  ip: string;
  progress: number;
  seed: number;
  up_speed: number;
}

export interface DelugeCoreTorrentTracker {
  url: string;
  tier: number;
}

export interface DelugeCoreTorrentTrackerStatuses extends DelugeCoreTorrentTracker {
  complete_sent: boolean;
  endpoints: [];
  fail_limit: number;
  fails: number;
  last_error: {
    value: number;
    category: string;
  };
  message: string;
  min_announce: null;
  next_announce: null;
  scrape_complete: number;
  scrape_downloaded: number;
  scrape_incomplete: number;
  send_stats: boolean;
  source: number;
  start_sent: boolean;
  trackerid: string;
  updating: boolean;
  verified: boolean;
}

export type DelugeCoreTorrentState = 'Downloading' | 'Seeding' | 'Paused' | 'Checking' | 'Queued' | 'Error';

export type DelugeCoreTorrentStorageMode = 'sparse' | 'allocate';

export interface DelugeCoreTorrentStatuses {
  active_time: number;
  seeding_time: unknown;
  finished_time: number;
  all_time_download: unknown;
  storage_mode: DelugeCoreTorrentStorageMode;
  distributed_copies: unknown;
  download_payload_rate: number;
  file_priorities: DelugeCoreTorrentFilePriority[];
  hash: unknown;
  auto_managed: unknown;
  is_auto_managed: unknown;
  is_finished: unknown;
  max_connections: unknown;
  max_download_speed: unknown;
  max_upload_slots: unknown;
  max_upload_speed: unknown;
  message: string;
  move_completed_path: unknown;
  move_completed: unknown;
  next_announce: unknown;
  num_peers: number;
  num_seeds: number;
  owner: unknown;
  paused: unknown;
  prioritize_first_last_pieces: unknown;
  sequential_download: boolean;
  progress: number;
  shared: unknown;
  remove_at_ratio: unknown;
  download_location: string;
  seeds_peers_ratio: unknown;
  seed_rank: unknown;
  state: DelugeCoreTorrentState;
  stop_at_ratio: unknown;
  stop_ratio: unknown;
  time_added: number;
  total_done: number;
  total_payload_download: number;
  total_payload_upload: number;
  total_peers: number;
  total_seeds: number;
  total_uploaded: unknown;
  total_wanted: unknown;
  total_remaining: unknown;
  tracker: unknown;
  tracker_host: string;
  trackers: Array<DelugeCoreTorrentTrackerStatuses>;
  tracker_status: unknown;
  upload_payload_rate: number;
  comment: string;
  creator: unknown;
  num_files: unknown;
  num_pieces: unknown;
  piece_length: unknown;
  private: boolean;
  total_size: number;
  eta: number;
  file_progress: number[];
  files: DelugeCoreTorrentFile[];
  orig_files: unknown;
  is_seed: unknown;
  peers: DelugeCoreTorrentPeer[];
  queue: unknown;
  ratio: number;
  completed_time: unknown;
  last_seen_complete: unknown;
  name: string;
  pieces: unknown;
  seed_mode: unknown;
  super_seeding: boolean;
  time_since_download: unknown;
  time_since_upload: unknown;
  time_since_transfer: unknown;
}

export enum DelugeCoreEncryptionPolicy {
  Forced = 0,
  Enabled = 1,
  Disabled = 2,
}

export enum DelugeCoreEncryptionLevel {
  Handshake = 0,
  FullStream = 1,
  Either = 2,
}

export interface DelugeCorePreferences {
  // Send anonymous statistics
  send_info: boolean;
  // Anonymous stats sent
  info_sent: number;
  // Daemon port:
  daemon_port: number;
  // Allow Remote Connections
  allow_remote: boolean;
  // Preallocate Disk Space
  pre_allocate_storage: boolean;
  // Download Folder
  download_location: string;
  // Incoming Port [from, to]
  listen_ports: number[];
  // IP address of the interface to listen on
  listen_interface: string;
  // The network interface name or IP address for outgoing BitTorrent connections
  outgoing_interface: string;
  // Use Random Ports
  random_port: boolean;
  listen_random_port: number[];
  listen_use_sys_port: boolean;
  listen_reuse_port: boolean;
  // Outgoing Ports [from, to]
  outgoing_ports: number[];
  random_outgoing_ports: boolean;
  // Copy .torrent files
  copy_torrent_file: boolean;
  // Delete copy of torrent file on remove'
  del_copy_torrent_file: boolean;
  // Copy of .torrent files to
  torrentfiles_location: string;
  plugins_location: string;
  // Prioritize first and last pieces of torrent
  prioritize_first_last_pieces: boolean;
  // Sequential download
  sequential_download: boolean;
  // DHT
  dht: boolean;
  // UPnP
  upnp: boolean;
  // NAT-PMP
  natpmp: boolean;
  // Peer Exchange
  utpex: boolean;
  // LSD
  lsd: boolean;
  // Encryption - Incoming
  enc_in_policy: DelugeCoreEncryptionPolicy;
  // Encryption - Outgoing
  enc_out_policy: DelugeCoreEncryptionPolicy;
  // Encryption - Level
  enc_level: DelugeCoreEncryptionLevel;
  // Maximum Connections
  max_connections_global: number;
  // Maximum Upload Speed (KiB/s)
  max_upload_speed: number;
  // Maximum Download Speed (KiB/s)
  max_download_speed: number;
  // Maximum Upload Slots
  max_upload_slots_global: number;
  // Maximum Half-Open Connections
  max_half_open_connections: number;
  // Maximum Connection Attempts per Second
  max_connections_per_second: number;
  // Ignore limits on local network
  ignore_limits_on_local_network: boolean;
  // Maximum Connections per torrent
  max_connections_per_torrent: number;
  // Maximum Upload Slots per torrent
  max_upload_slots_per_torrent: number;
  // Maximum Upload Speed per torrent (KiB/s)
  max_upload_speed_per_torrent: number;
  // Maximum Download Speed per torrent (KiB/s)
  max_download_speed_per_torrent: number;
  enabled_plugins: string[];
  // Add torrents in Paused state
  add_paused: boolean;
  // maximum number of active seeding torrents
  max_active_seeding: number;
  // maximum number of active downloading torrents
  max_active_downloading: number;
  // absolute maximum number of active torrents
  max_active_limit: number;
  // Ignore slow torrents
  dont_count_slow_torrents: boolean;
  // New Torrents - Queue to top
  queue_new_to_top: boolean;
  // Share Ratio Reached - Pause torrent
  stop_seed_at_ratio: boolean;
  // Share Ratio Reached - Remove torrent
  remove_seed_at_ratio: boolean;
  // Share Ratio - Pause torrent
  stop_seed_ratio: number;
  // Share Ratio
  share_ratio_limit: number;
  // Time Ratio
  seed_time_ratio_limit: number;
  // Time (m)
  seed_time_limit: number;
  // Auto Managed
  auto_managed: boolean;
  // Move Completed
  move_completed: boolean;
  move_completed_path: string;
  move_completed_paths_list: string[];
  download_location_paths_list: string[];
  path_chooser_show_chooser_button_on_localhost: boolean;
  path_chooser_auto_complete_enabled: boolean;
  path_chooser_accelerator_string: string;
  path_chooser_max_popup_rows: number;
  path_chooser_show_hidden_files: boolean;
  // Periodically check the website for new releases
  new_release_check: boolean;
  proxy: {
    type: number;
    hostname: string;
    username: string;
    password: string;
    port: number;
    proxy_hostnames: boolean;
    proxy_peer_connections: boolean;
    proxy_tracker_connections: boolean;
    force_proxy: boolean;
    anonymous_mode: boolean;
  };
  // Peer TOS Byte
  peer_tos: string;
  // Rate limit IP overhead
  rate_limit_ip_overhead: boolean;
  // GeoIP Database Path
  geoip_db_location: string;
  // Cache Size (16 KiB Blocks)
  cache_size: number;
  // Cache Expiry (seconds)
  cache_expiry: number;
  // Prefer seeding torrents
  auto_manage_prefer_seeds: boolean;
  // Shared between other Deluge users or not
  shared: boolean;
  // Super Seed
  super_seeding: boolean;
}

export interface LibTorrentSessionStatuses {
  'peer.error_peers': unknown;
  'peer.disconnected_peers': unknown;

  // these counters break down the peer errors into more specific
  // categories. These errors are what the underlying transport
  // reported (i.e. TCP or uTP)
  'peer.eof_peers': unknown;
  'peer.connreset_peers': unknown;
  'peer.connrefused_peers': unknown;
  'peer.connaborted_peers': unknown;
  'peer.notconnected_peers': unknown;
  'peer.perm_peers': unknown;
  'peer.buffer_peers': unknown;
  'peer.unreachable_peers': unknown;
  'peer.broken_pipe_peers': unknown;
  'peer.addrinuse_peers': unknown;
  'peer.no_access_peers': unknown;
  'peer.invalid_arg_peers': unknown;
  'peer.aborted_peers': unknown;

  // the total number of incoming piece requests we've received followed
  // by the number of rejected piece requests for various reasons.
  // max_piece_requests mean we already had too many outstanding requests
  // from this peer, so we rejected it. cancelled_piece_requests are ones
  // where the other end explicitly asked for the piece to be rejected.
  'peer.piece_requests': unknown;
  'peer.max_piece_requests': unknown;
  'peer.invalid_piece_requests': unknown;
  'peer.choked_piece_requests': unknown;
  'peer.cancelled_piece_requests': unknown;
  'peer.piece_rejects': unknown;

  // these counters break down the peer errors into
  // whether they happen on incoming or outgoing peers.
  'peer.error_incoming_peers': unknown;
  'peer.error_outgoing_peers': unknown;

  // these counters break down the peer errors into
  // whether they happen on encrypted peers (just
  // encrypted handshake) and rc4 peers (full stream
  // encryption). These can indicate whether encrypted
  // peers are more or less likely to fail
  'peer.error_rc4_peers': unknown;
  'peer.error_encrypted_peers': unknown;

  // these counters break down the peer errors into
  // whether they happen on uTP peers or TCP peers.
  // these may indicate whether one protocol is
  // more error prone
  'peer.error_tcp_peers': unknown;
  'peer.error_utp_peers': unknown;

  // these counters break down the reasons to
  // disconnect peers.
  'peer.connect_timeouts': unknown;
  'peer.uninteresting_peers': unknown;
  'peer.timeout_peers': unknown;
  'peer.no_memory_peers': unknown;
  'peer.too_many_peers': unknown;
  'peer.transport_timeout_peers': unknown;
  'peer.num_banned_peers': unknown;
  'peer.banned_for_hash_failure': unknown;

  'peer.connection_attempts': unknown;
  'peer.connection_attempt_loops': unknown;
  'peer.boost_connection_attempts': unknown;
  'peer.missed_connection_attempts': unknown;
  'peer.no_peer_connection_attempts': unknown;
  'peer.incoming_connections': unknown;

  // the number of peer connections for each kind of socket.
  // ``num_peers_half_open`` counts half-open (connecting) peers, no other
  // count includes those peers.
  // ``num_peers_up_unchoked_all`` is the total number of unchoked peers,
  // whereas ``num_peers_up_unchoked`` only are unchoked peers that count
  // against the limit (i.e. excluding peers that are unchoked because the
  // limit doesn't apply to them). ``num_peers_up_unchoked_optimistic`` is
  // the number of optimistically unchoked peers.
  'peer.num_tcp_peers': unknown;
  'peer.num_socks5_peers': unknown;
  'peer.num_http_proxy_peers': unknown;
  'peer.num_utp_peers': unknown;
  'peer.num_i2p_peers': unknown;
  'peer.num_ssl_peers': unknown;
  'peer.num_ssl_socks5_peers': unknown;
  'peer.num_ssl_http_proxy_peers': unknown;
  'peer.num_ssl_utp_peers': unknown;

  'peer.num_peers_half_open': unknown;
  'peer.num_peers_connected': unknown;
  'peer.num_peers_up_interested': unknown;
  'peer.num_peers_down_interested': unknown;
  'peer.num_peers_up_unchoked_all': unknown;
  'peer.num_peers_up_unchoked_optimistic': unknown;
  'peer.num_peers_up_unchoked': unknown;
  'peer.num_peers_down_unchoked': unknown;
  'peer.num_peers_up_requests': unknown;
  'peer.num_peers_down_requests': unknown;
  'peer.num_peers_end_game': unknown;
  'peer.num_peers_up_disk': unknown;
  'peer.num_peers_down_disk': unknown;

  // These counters count the number of times the
  // network thread wakes up for each respective
  // reason. If these counters are very large, it
  // may indicate a performance issue, causing the
  // network thread to wake up too ofte, wasting CPU.
  // mitigate it by increasing buffers and limits
  // for the specific trigger that wakes up the
  // thread.
  'net.on_read_counter': unknown;
  'net.on_write_counter': unknown;
  'net.on_tick_counter': unknown;
  'net.on_lsd_counter': unknown;
  'net.on_lsd_peer_counter': unknown;
  'net.on_udp_counter': unknown;
  'net.on_accept_counter': unknown;
  'net.on_disk_queue_counter': unknown;
  'net.on_disk_counter': unknown;

  // total number of bytes sent and received by the session
  'net.sent_payload_bytes': number;
  'net.sent_bytes': number;
  'net.sent_ip_overhead_bytes': number;
  'net.sent_tracker_bytes': number;
  'net.recv_payload_bytes': number;
  'net.recv_bytes': number;
  'net.recv_ip_overhead_bytes': number;
  'net.recv_tracker_bytes': number;

  // the number of sockets currently waiting for upload and download
  // bandwidth from the rate limiter.
  'net.limiter_up_queue': unknown;
  'net.limiter_down_queue': unknown;

  // the number of upload and download bytes waiting to be handed out from
  // the rate limiter.
  'net.limiter_up_bytes': unknown;
  'net.limiter_down_bytes': unknown;

  // the number of bytes downloaded that had to be discarded because they
  // failed the hash check
  'net.recv_failed_bytes': unknown;

  // the number of downloaded bytes that were discarded because they
  // were downloaded multiple times (from different peers)
  'net.recv_redundant_bytes': unknown;

  // is false by default and set to true when
  // the first incoming connection is established
  // this is used to know if the client is behind
  // NAT or not.
  'net.has_incoming_connections': unknown;

  // these gauges count the number of torrents in
  // different states. Each torrent only belongs to
  // one of these states. For torrents that could
  // belong to multiple of these, the most prominent
  // in picked. For instance, a torrent with an error
  // counts as an error-torrent, regardless of its other
  // state.
  'ses.num_checking_torrents': unknown;
  'ses.num_stopped_torrents': unknown;
  'ses.num_upload_only_torrents': unknown;
  'ses.num_downloading_torrents': unknown;
  'ses.num_seeding_torrents': unknown;
  'ses.num_queued_seeding_torrents': unknown;
  'ses.num_queued_download_torrents': unknown;
  'ses.num_error_torrents': unknown;

  // the number of torrents that don't have the
  // IP filter applied to them.
  'ses.non_filter_torrents': unknown;

  // these count the number of times a piece has passed the
  // hash check, the number of times a piece was successfully
  // written to disk and the number of total possible pieces
  // added by adding torrents. e.g. when adding a torrent with
  // 1000 piece, num_total_pieces_added is incremented by 1000.
  'ses.num_piece_passed': unknown;
  'ses.num_piece_failed': unknown;

  'ses.num_have_pieces': unknown;
  'ses.num_total_pieces_added': unknown;

  // this counts the number of times a torrent has been
  // evicted (only applies when dynamic-loading-of-torrent-files
  // is enabled, which is deprecated).
  'ses.torrent_evicted_counter': unknown;

  // the number of allowed unchoked peers
  'ses.num_unchoke_slots': unknown;

  // the number of listen sockets that are currently accepting incoming
  // connections
  'ses.num_outstanding_accept': unknown;

  // bittorrent message counters. These counters are incremented
  // every time a message of the corresponding type is received from
  // or sent to a bittorrent peer.
  'ses.num_incoming_choke': unknown;
  'ses.num_incoming_unchoke': unknown;
  'ses.num_incoming_interested': unknown;
  'ses.num_incoming_not_interested': unknown;
  'ses.num_incoming_have': unknown;
  'ses.num_incoming_bitfield': unknown;
  'ses.num_incoming_request': unknown;
  'ses.num_incoming_piece': unknown;
  'ses.num_incoming_cancel': unknown;
  'ses.num_incoming_dht_port': unknown;
  'ses.num_incoming_suggest': unknown;
  'ses.num_incoming_have_all': unknown;
  'ses.num_incoming_have_none': unknown;
  'ses.num_incoming_reject': unknown;
  'ses.num_incoming_allowed_fast': unknown;
  'ses.num_incoming_ext_handshake': unknown;
  'ses.num_incoming_pex': unknown;
  'ses.num_incoming_metadata': unknown;
  'ses.num_incoming_extended': unknown;

  'ses.num_outgoing_choke': unknown;
  'ses.num_outgoing_unchoke': unknown;
  'ses.num_outgoing_interested': unknown;
  'ses.num_outgoing_not_interested': unknown;
  'ses.num_outgoing_have': unknown;
  'ses.num_outgoing_bitfield': unknown;
  'ses.num_outgoing_request': unknown;
  'ses.num_outgoing_piece': unknown;
  'ses.num_outgoing_cancel': unknown;
  'ses.num_outgoing_dht_port': unknown;
  'ses.num_outgoing_suggest': unknown;
  'ses.num_outgoing_have_all': unknown;
  'ses.num_outgoing_have_none': unknown;
  'ses.num_outgoing_reject': unknown;
  'ses.num_outgoing_allowed_fast': unknown;
  'ses.num_outgoing_ext_handshake': unknown;
  'ses.num_outgoing_pex': unknown;
  'ses.num_outgoing_metadata': unknown;
  'ses.num_outgoing_extended': unknown;

  // the number of wasted downloaded bytes by reason of the bytes being
  // wasted.
  'ses.waste_piece_timed_out': unknown;
  'ses.waste_piece_cancelled': unknown;
  'ses.waste_piece_unknown': unknown;
  'ses.waste_piece_seed': unknown;
  'ses.waste_piece_end_game': unknown;
  'ses.waste_piece_closing': unknown;

  // the number of pieces considered while picking pieces
  'picker.piece_picker_partial_loops': unknown;
  'picker.piece_picker_suggest_loops': unknown;
  'picker.piece_picker_sequential_loops': unknown;
  'picker.piece_picker_reverse_rare_loops': unknown;
  'picker.piece_picker_rare_loops': unknown;
  'picker.piece_picker_rand_start_loops': unknown;
  'picker.piece_picker_rand_loops': unknown;
  'picker.piece_picker_busy_loops': unknown;

  // This breaks down the piece picks into the event that
  // triggered it
  'picker.reject_piece_picks': unknown;
  'picker.unchoke_piece_picks': unknown;
  'picker.incoming_redundant_piece_picks': unknown;
  'picker.incoming_piece_picks': unknown;
  'picker.end_game_piece_picks': unknown;
  'picker.snubbed_piece_picks': unknown;
  'picker.interesting_piece_picks': unknown;
  'picker.hash_fail_piece_picks': unknown;

  // These gauges indicate how many blocks are currently in use as dirty
  // disk blocks (``write_cache_blocks``) and read cache blocks,
  // respectively. deprecates ``cache_status::read_cache_size``.
  // The sum of these gauges deprecates ``cache_status::cache_size``.
  'disk.write_cache_blocks': unknown;
  'disk.read_cache_blocks': unknown;

  // the number of microseconds it takes from receiving a request from a
  // peer until we're sending the response back on the socket.
  'disk.request_latency': unknown;

  // ``disk_blocks_in_use`` indicates how many disk blocks are currently in
  // use, either as dirty blocks waiting to be written or blocks kept around
  // in the hope that a peer will request it or in a peer send buffer. This
  // gauge deprecates ``cache_status::total_used_buffers``.
  'disk.pinned_blocks': unknown;
  'disk.disk_blocks_in_use': unknown;

  // ``queued_disk_jobs`` is the number of disk jobs currently queued,
  // waiting to be executed by a disk thread. Deprecates
  // ``cache_status::job_queue_length``.
  'disk.queued_disk_jobs': unknown;
  'disk.num_running_disk_jobs': unknown;
  'disk.num_read_jobs': unknown;
  'disk.num_write_jobs': unknown;
  'disk.num_jobs': unknown;
  'disk.blocked_disk_jobs': unknown;

  'disk.num_writing_threads': unknown;
  'disk.num_running_threads': unknown;

  // the number of bytes we have sent to the disk I/O
  // thread for writing. Every time we hear back from
  // the disk I/O thread with a completed write job, this
  // is updated to the number of bytes the disk I/O thread
  // is actually waiting for to be written (as opposed to
  // bytes just hanging out in the cache)
  'disk.queued_write_bytes': unknown;
  'disk.arc_mru_size': unknown;
  'disk.arc_mru_ghost_size': unknown;
  'disk.arc_mfu_size': unknown;
  'disk.arc_mfu_ghost_size': unknown;
  'disk.arc_write_size': unknown;
  'disk.arc_volatile_size': unknown;

  // the number of blocks written and read from disk in total. A block is 16
  // kiB. ``num_blocks_written`` and ``num_blocks_read`` deprecates
  // ``cache_status::blocks_written`` and ``cache_status::blocks_read`` respectively.
  'disk.num_blocks_written': unknown;
  'disk.num_blocks_read': unknown;

  // the total number of blocks run through SHA-1 hashing
  'disk.num_blocks_hashed': unknown;

  // the number of blocks read from the disk cache
  // Deprecates ``cache_info::blocks_read_hit``.
  'disk.num_blocks_cache_hits': unknown;

  // the number of disk I/O operation for reads and writes. One disk
  // operation may transfer more then one block.
  // These counters deprecates ``cache_status::writes`` and
  // ``cache_status::reads``.
  'disk.num_write_ops': unknown;
  'disk.num_read_ops': unknown;

  // the number of blocks that had to be read back from disk in order to
  // hash a piece (when verifying against the piece hash)
  'disk.num_read_back': unknown;

  // cumulative time spent in various disk jobs, as well
  // as total for all disk jobs. Measured in microseconds
  'disk.disk_read_time': unknown;
  'disk.disk_write_time': unknown;
  'disk.disk_hash_time': unknown;
  'disk.disk_job_time': unknown;

  // for each kind of disk job, a counter of how many jobs of that kind
  // are currently blocked by a disk fence
  'disk.num_fenced_read': unknown;
  'disk.num_fenced_write': unknown;
  'disk.num_fenced_hash': unknown;
  'disk.num_fenced_move_storage': unknown;
  'disk.num_fenced_release_files': unknown;
  'disk.num_fenced_delete_files': unknown;
  'disk.num_fenced_check_fastresume': unknown;
  'disk.num_fenced_save_resume_data': unknown;
  'disk.num_fenced_rename_file': unknown;
  'disk.num_fenced_stop_torrent': unknown;
  'disk.num_fenced_flush_piece': unknown;
  'disk.num_fenced_flush_hashed': unknown;
  'disk.num_fenced_flush_storage': unknown;
  'disk.num_fenced_trim_cache': unknown;
  'disk.num_fenced_file_priority': unknown;
  'disk.num_fenced_load_torrent': unknown;
  'disk.num_fenced_clear_piece': unknown;
  'disk.num_fenced_tick_storage': unknown;

  // The number of nodes in the DHT routing table
  'dht.dht_nodes': unknown;

  // The number of replacement nodes in the DHT routing table
  'dht.dht_node_cache': unknown;

  // the number of torrents currently tracked by our DHT node
  'dht.dht_torrents': unknown;

  // the number of peers currently tracked by our DHT node
  'dht.dht_peers': unknown;

  // the number of immutable data items tracked by our DHT node
  'dht.dht_immutable_data': unknown;

  // the number of mutable data items tracked by our DHT node
  'dht.dht_mutable_data': unknown;

  // the number of RPC observers currently allocated
  'dht.dht_allocated_observers': unknown;

  // the total number of DHT messages sent and received
  'dht.dht_messages_in': unknown;
  'dht.dht_messages_out': unknown;

  // the number of incoming DHT requests that were dropped. There are a few
  // different reasons why incoming DHT packets may be dropped:
  //
  // 1. there wasn't enough send quota to respond to them.
  // 2. the Denial of service logic kicked in, blocking the peer
  // 3. ignore_dark_internet is enabled, and the packet came from a
  //    non-public IP address
  // 4. the bencoding of the message was invalid
  'dht.dht_messages_in_dropped': unknown;

  // the number of outgoing messages that failed to be
  // sent
  'dht.dht_messages_out_dropped': unknown;

  // the total number of bytes sent and received by the DHT
  'dht.dht_bytes_in': unknown;
  'dht.dht_bytes_out': unknown;

  // the number of DHT messages we've sent and received
  // by kind.
  'dht.dht_ping_in': unknown;
  'dht.dht_ping_out': unknown;
  'dht.dht_find_node_in': unknown;
  'dht.dht_find_node_out': unknown;
  'dht.dht_get_peers_in': unknown;
  'dht.dht_get_peers_out': unknown;
  'dht.dht_announce_peer_in': unknown;
  'dht.dht_announce_peer_out': unknown;
  'dht.dht_get_in': unknown;
  'dht.dht_get_out': unknown;
  'dht.dht_put_in': unknown;
  'dht.dht_put_out': unknown;
  'dht.dht_sample_infohashes_in': unknown;
  'dht.dht_sample_infohashes_out': unknown;

  // the number of failed incoming DHT requests by kind of request
  'dht.dht_invalid_announce': unknown;
  'dht.dht_invalid_get_peers': unknown;
  'dht.dht_invalid_find_node': unknown;
  'dht.dht_invalid_put': unknown;
  'dht.dht_invalid_get': unknown;
  'dht.dht_invalid_sample_infohashes': unknown;

  // uTP counters. Each counter represents the number of time each event
  // has occurred.
  'utp.utp_packet_loss': unknown;
  'utp.utp_timeout': unknown;
  'utp.utp_packets_in': unknown;
  'utp.utp_packets_out': unknown;
  'utp.utp_fast_retransmit': unknown;
  'utp.utp_packet_resend': unknown;
  'utp.utp_samples_above_target': unknown;
  'utp.utp_samples_below_target': unknown;
  'utp.utp_payload_pkts_in': unknown;
  'utp.utp_payload_pkts_out': unknown;
  'utp.utp_invalid_pkts_in': unknown;
  'utp.utp_redundant_pkts_in': unknown;

  // the number of uTP sockets in each respective state
  'utp.num_utp_idle': unknown;
  'utp.num_utp_syn_sent': unknown;
  'utp.num_utp_connected': unknown;
  'utp.num_utp_fin_sent': unknown;
  'utp.num_utp_close_wait': unknown;
  'utp.num_utp_deleted': unknown;

  // the buffer sizes accepted by
  // socket send and receive calls respectively.
  // The larger the buffers are, the more efficient,
  // because it reqire fewer system calls per byte.
  // The size is 1 << n, where n is the number
  // at the end of the counter name. i.e.
  // 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192,
  // 16384, 32768, 65536, 131072, 262144, 524288, 1048576
  // bytes
  'sock_bufs.socket_send_size3': unknown;
  'sock_bufs.socket_send_size4': unknown;
  'sock_bufs.socket_send_size5': unknown;
  'sock_bufs.socket_send_size6': unknown;
  'sock_bufs.socket_send_size7': unknown;
  'sock_bufs.socket_send_size8': unknown;
  'sock_bufs.socket_send_size9': unknown;
  'sock_bufs.socket_send_size10': unknown;
  'sock_bufs.socket_send_size11': unknown;
  'sock_bufs.socket_send_size12': unknown;
  'sock_bufs.socket_send_size13': unknown;
  'sock_bufs.socket_send_size14': unknown;
  'sock_bufs.socket_send_size15': unknown;
  'sock_bufs.socket_send_size16': unknown;
  'sock_bufs.socket_send_size17': unknown;
  'sock_bufs.socket_send_size18': unknown;
  'sock_bufs.socket_send_size19': unknown;
  'sock_bufs.socket_send_size20': unknown;
  'sock_bufs.socket_recv_size3': unknown;
  'sock_bufs.socket_recv_size4': unknown;
  'sock_bufs.socket_recv_size5': unknown;
  'sock_bufs.socket_recv_size6': unknown;
  'sock_bufs.socket_recv_size7': unknown;
  'sock_bufs.socket_recv_size8': unknown;
  'sock_bufs.socket_recv_size9': unknown;
  'sock_bufs.socket_recv_size10': unknown;
  'sock_bufs.socket_recv_size11': unknown;
  'sock_bufs.socket_recv_size12': unknown;
  'sock_bufs.socket_recv_size13': unknown;
  'sock_bufs.socket_recv_size14': unknown;
  'sock_bufs.socket_recv_size15': unknown;
  'sock_bufs.socket_recv_size16': unknown;
  'sock_bufs.socket_recv_size17': unknown;
  'sock_bufs.socket_recv_size18': unknown;
  'sock_bufs.socket_recv_size19': unknown;
  'sock_bufs.socket_recv_size20': unknown;

  // if the outstanding tracker announce limit is reached, tracker
  // announces are queued, to be issued when an announce slot opens up.
  // this measure the number of tracker announces currently in the
  // queue
  'tracker.num_queued_tracker_announces': unknown;
}

export interface DelugeCoreSessionStatuses extends LibTorrentSessionStatuses {
  // Session status rate keys associated with session status counters.
  dht_download_rate: number;
  dht_upload_rate: number;
  ip_overhead_download_rate: number;
  ip_overhead_upload_rate: number;
  payload_download_rate: number;
  payload_upload_rate: number;
  tracker_download_rate: number;
  tracker_upload_rate: number;
  download_rate: number;
  upload_rate: number;
}
