import axios, {AxiosError, AxiosResponse} from 'axios';
import crypto from 'crypto';
import fs, {WriteFileOptions} from 'fs';

import {getTempPath} from '../models/TemporaryStorage';

/**
 * Gets a randomly generated file path for temp file.
 *
 * @return {string} - path
 */
const getTempFilePath = (extension = 'tmp'): string => {
  return getTempPath(`${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extension}`);
};

/**
 * Deletes the file after 5 minutes
 */
const delayedDelete = (tempPath: string): void => {
  setTimeout(() => {
    try {
      fs.unlinkSync(tempPath);
    } catch {
      // do nothing.
    }
  }, 1000 * 60 * 5);
};

/**
 * Saves buffer to temporary storage as a file.
 *
 * @param {Buffer} buffer - buffer
 * @param {string} extension - file extension of temp file
 * @return {string} - path of saved temporary file. deleted after 5 minutes.
 */
export const saveBufferToTempFile = async (
  buffer: Buffer,
  extension?: string,
  options?: WriteFileOptions,
): Promise<string> => {
  const tempPath = getTempFilePath(extension);

  fs.writeFileSync(tempPath, buffer, options);

  delayedDelete(tempPath);

  return tempPath;
};

/**
 * Fetches from URL to temporary storage.
 *
 * @param {string} url - URL
 * @param {string} extension - file extension of temp file
 * @return {string} - path of saved temporary file. deleted after 5 minutes.
 */
export const fetchURLToTempFile = async (url: string, cookies?: Array<string>, extension?: string): Promise<string> => {
  const tempPath = getTempFilePath(extension);

  return new Promise((resolve, reject) => {
    axios({
      method: 'GET',
      url,
      responseType: 'stream',
      headers: cookies
        ? {
            Cookie: cookies.join('; ').concat(';'),
          }
        : undefined,
    }).then(
      (res: AxiosResponse) => {
        delayedDelete(tempPath);
        res.data.pipe(fs.createWriteStream(tempPath)).on('finish', () => resolve(tempPath));
      },
      (e: AxiosError) => {
        reject(e);
      },
    );
  });
};
