const chromecastableExtensions: Record<string, string> = {
  apng: 'image/apng',
  bmp: 'image/bmp',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  ts: 'video/mp2t',
  m2ts: 'video/mp2t',
  mp2t: 'video/mp2t',
  mp3: 'audio/mpeg3',
  mp4: 'video/mp4',
  ogg: 'application/ogg',
  wav: 'audio/wav',
  webm: 'video/webm',
  mkv: 'video/webm',
  flac: 'audio/flac',
  aac: 'audio/aac',
};

const subtitleExtensions: string[] = ['mkv', 'vtt', 'srt'];

export function isFileChromecastable(filename: string): boolean {
  const fileExtension = filename.split('.').pop();
  if (!fileExtension) return false;
  return fileExtension in chromecastableExtensions;
}

export function getChromecastContentType(filename: string): string | undefined {
  const fileExtension = filename.split('.').pop();
  return fileExtension ? chromecastableExtensions[fileExtension] : undefined;
}

export function isFileSubtitles(filename: string): boolean {
  const fileExtension = filename.split('.').pop();
  if (!fileExtension) return false;
  return subtitleExtensions.includes(fileExtension);
}
