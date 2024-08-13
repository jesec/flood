import fs from 'node:fs';
import path from 'node:path';

import axios, {AxiosError} from 'axios';

import {isAllowedPath} from './fileUtil';

export const fetchUrls = async (
  inputUrls: string[],
  cookies: {[domain: string]: string[]},
): Promise<{files: Buffer[]; urls: string[]}> => {
  const files: Buffer[] = [];
  const urls: string[] = [];

  await Promise.all(
    inputUrls.map(async (url) => {
      if (url.startsWith('http:') || url.startsWith('https:')) {
        const domain = url.split('/')[2];

        const file = await axios({
          method: 'GET',
          url,
          responseType: 'arraybuffer',
          headers: cookies?.[domain]
            ? {
                Cookie: cookies[domain].join('; ').concat(';'),
              }
            : undefined,
        }).then(
          (res) => res.data,
          (e: AxiosError) => console.error(e),
        );

        if (file instanceof Buffer) {
          files.push(file);
        }

        return;
      }

      if (fs.existsSync(url) && isAllowedPath(path.resolve(url))) {
        try {
          files.push(await fs.promises.readFile(url));
          return;
        } catch {
          // do nothing.
        }
      }

      urls.push(url);
    }),
  );

  return {files, urls};
};
