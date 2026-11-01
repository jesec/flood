import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// NeDB keeps writing asynchronously and offers no way to close a database, so
// per-test-file runtime directories must outlive every test file of the project.
export default function setup(project) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'flood.test.'));

  project.provide('floodTestTemporaryRoot', temporaryRoot);

  return () => {
    fs.rmSync(temporaryRoot, {recursive: true, force: true});
  };
}
