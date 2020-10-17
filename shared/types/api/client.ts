import type {ClientSettings} from '../ClientSettings';

// PATCH /api/client/settings
export type SetClientSettingsOptions = Partial<Omit<ClientSettings, 'dhtStats'>>;
