#!/usr/bin/env node
// Compile the vendored rstorrent.proto to TypeScript via ts-proto (grpc-js services).
//
// Usage: pnpm run proto:generate
//
// Requires `grpc-tools` (vendored protoc binary) and `ts-proto` (protoc plugin).
// The generated file is committed; CI does not need protoc installed.
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const protoDir = path.join(root, 'server/services/rstorrent/proto');
const protoc = path.join(root, 'node_modules/grpc-tools/bin/protoc');
const plugin = path.join(root, 'node_modules/.bin/protoc-gen-ts_proto');

execFileSync(
  protoc,
  [
    `--plugin=protoc-gen-ts_proto=${plugin}`,
    `--ts_proto_out=${protoDir}`,
    '--ts_proto_opt=outputServices=grpc-js,env=node,forceLong=bigint,esModuleInterop=true,oneof=groups',
    `-I${protoDir}`,
    path.join(protoDir, 'rstorrent.proto'),
  ],
  {cwd: root, stdio: 'inherit'},
);
