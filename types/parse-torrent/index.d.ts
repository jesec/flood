declare namespace ParseTorrent {
  interface Instance {
    infoHash: string;
    infoHashBuffer?: Uint8Array | undefined;
    name?: string | undefined;
    announce?: string[] | undefined;
    urlList?: string[] | undefined;
    private?: boolean | undefined;
    created?: Date | undefined;
    createdBy?: string | undefined;
    comment?: string | undefined;
    info?: Record<string, unknown> | undefined;
    infoBuffer?: Uint8Array | undefined;
    files?: Array<{path: string; name: string; length: number; offset: number}> | undefined;
    length?: number | undefined;
    pieceLength?: number | undefined;
    lastPieceLength?: number | undefined;
    pieces?: string[] | undefined;
  }
}

declare function parseTorrent(
  torrentId: string | ArrayBufferView | ParseTorrent.Instance,
): Promise<ParseTorrent.Instance>;

export default parseTorrent;

export function remote(
  torrentId: string | ArrayBufferView | ParseTorrent.Instance | Blob,
  opts?: Record<string, unknown>,
  cb?: (err: Error | null, torrent?: ParseTorrent.Instance) => void,
): void;

export function remote(
  torrentId: string | ArrayBufferView | ParseTorrent.Instance | Blob,
  cb: (err: Error | null, torrent?: ParseTorrent.Instance) => void,
): void;

export function toMagnetURI(parsed: ParseTorrent.Instance): string;
export function toTorrentFile(parsed: ParseTorrent.Instance): Uint8Array;
