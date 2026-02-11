const infoHashPattern = /^(?:[a-f0-9]{40}|[a-z2-7]{32})$/i;

export const normalizeTorrentUrl = (value: string): string => {
  const trimmed = value.trim();

  if (infoHashPattern.test(trimmed)) {
    return `magnet:?xt=urn:btih:${trimmed}`;
  }

  return value;
};
