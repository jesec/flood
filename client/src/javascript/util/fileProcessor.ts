interface ProcessedFile { name: string; data: string }

function processFile(file: File): Promise<ProcessedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', ({ target }) => {
      const result = target?.result as string;
      if (result && typeof result === 'string') {
        resolve({
          name: file?.name,
          data: result.split('base64,')[1]
        });
      } else {
        reject(new Error(`Error reading file: ${file?.name}`));
      }
    });
    reader.readAsDataURL(file);
  });
}

export type ProcessedFiles = Array<ProcessedFile>;
export async function processFiles(fileList: File[] | FileSystemFileHandle[]): Promise<ProcessedFiles> {
  const processedFiles = [];
  for (let file of fileList) {
    try {
      if (file instanceof FileSystemFileHandle) {
        file = await file.getFile();
      }
      const processedFile = await processFile(file);
      processedFiles.push(processedFile);
    } catch(error) {
      console.error(error);
    }
  }
  return processedFiles;
}