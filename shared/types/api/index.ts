import type {FloodSettings} from '../FloodSettings';

// PATCH /api/settings
export type SetFloodSettingsOptions = Partial<FloodSettings>;

// GET /api/directory-list
export interface DirectoryListQuery {
  path: string;
}

// GET /api/directory-list - success response
export interface DirectoryListResponse {
  path: string;
  separator: string;
  directories: string[];
  files: string[];
}
