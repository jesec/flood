import {chromecastableExtensions, subtitleExtensions} from '../../../../shared/constants/chromecastableExtensions';

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
