import type {UserInDatabase} from '@shared/schema/Auth';

import ClientGatewayService from './clientGatewayService';
import DelugeClientGatewayService from './Deluge/clientGatewayService';
import FeedService from './feedService';
import HistoryService from './historyService';
import NotificationService from './notificationService';
import QBittorrentClientGatewayService from './qBittorrent/clientGatewayService';
import RTorrentClientGatewayService from './rTorrent/clientGatewayService';
import SettingService from './settingService';
import TaxonomyService from './taxonomyService';
import TorrentService from './torrentService';
import TransmissionClientGatewayService from './Transmission/clientGatewayService';

export interface ServiceInstances {
  clientGatewayService: ClientGatewayService;
  feedService: FeedService;
  historyService: HistoryService;
  notificationService: NotificationService;
  settingService: SettingService;
  taxonomyService: TaxonomyService;
  torrentService: TorrentService;
}

const serviceInstances: Record<string, ServiceInstances> = {};

const newClientGatewayService = (user: UserInDatabase): ClientGatewayService => {
  switch (user.client.client) {
    case 'Deluge':
      return new DelugeClientGatewayService(user);
    case 'qBittorrent':
      return new QBittorrentClientGatewayService(user);
    case 'rTorrent':
      return new RTorrentClientGatewayService(user);
    case 'Transmission':
      return new TransmissionClientGatewayService(user);
  }
};

export const getAllServices = ({_id}: UserInDatabase) => {
  return serviceInstances[_id];
};

export const destroyUserServices = async (userId: UserInDatabase['_id'], drop = false) => {
  const userServiceInstances = serviceInstances[userId];

  delete serviceInstances[userId];

  if (userServiceInstances === undefined || userServiceInstances === null) return;

  return Promise.all(
    Object.keys(userServiceInstances).map((key) => userServiceInstances[key as keyof ServiceInstances].destroy(drop)),
  );
};

export const bootstrapServicesForUser = (user: UserInDatabase) => {
  const {_id} = user;

  if (serviceInstances[_id] != null) {
    throw new Error('User instance already exists');
  }

  const userServiceInstances = {
    clientGatewayService: newClientGatewayService(user),
    feedService: new FeedService(user),
    historyService: new HistoryService(user),
    notificationService: new NotificationService(user),
    settingService: new SettingService(user),
    taxonomyService: new TaxonomyService(user),
    torrentService: new TorrentService(user),
  };

  Object.keys(userServiceInstances).forEach((key) => {
    const serviceName = key as keyof ServiceInstances;
    if (userServiceInstances[serviceName] != null) {
      userServiceInstances[serviceName].updateServices(userServiceInstances);
    }
  });

  serviceInstances[_id] = userServiceInstances;
};
