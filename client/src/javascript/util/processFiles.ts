export type ProcessedFiles = Array<{name: string; data: string}>;

const readFile = (file: File): Promise<ProcessedFiles[number]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve({name: file.name, data: e.target.result.split('base64,')[1]});
      } else {
        reject(new Error(`Unable to read file: ${file.name}`));
      }
    };
    reader.onerror = () => reject(new Error('File read failed', {cause: reader.error}));
    reader.readAsDataURL(file);
  });

// Reads each file into the base64 payload the add-torrent API expects.
const processFiles = (files: Array<File>): Promise<ProcessedFiles> => Promise.all(files.map(readFile));

export default processFiles;
