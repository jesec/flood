export const DELUGE_RPC_PROTOCOL_VERSION = 0x01;

// 1 byte protocol version + 4 bytes big-endian payload length
const HEADER_LENGTH = 5;

/**
 * Splits the Deluge RPC byte stream into frames.
 *
 * TCP does not preserve message boundaries: one `data` chunk can hold the tail of one frame and the
 * head of the next, and a frame (or even its 5-byte header) can be split across chunks. This keeps
 * any leftover bytes between chunks and returns every complete (still zlib-compressed) payload.
 */
export class DelugeRpcFrameDecoder {
  private buffer: Buffer | null = null;

  push(chunk: Buffer): Buffer[] {
    this.buffer = this.buffer == null ? chunk : Buffer.concat([this.buffer, chunk]);

    const payloads: Buffer[] = [];
    while (this.buffer != null && this.buffer.length >= HEADER_LENGTH) {
      if (this.buffer[0] !== DELUGE_RPC_PROTOCOL_VERSION) {
        throw new Error('Unexpected Deluge RPC version.');
      }

      const frameLength: number = HEADER_LENGTH + this.buffer.readUInt32BE(1);
      if (this.buffer.length < frameLength) {
        break;
      }

      payloads.push(this.buffer.subarray(HEADER_LENGTH, frameLength));
      this.buffer = this.buffer.length > frameLength ? this.buffer.subarray(frameLength) : null;
    }

    return payloads;
  }
}
