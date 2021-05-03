import type {UserInDatabase} from '@shared/schema/Auth';

import ClientGatewayService from './interfaces/clientGatewayService';
import FeedService from './feedService';
import HistoryService from './historyService';
import NotificationService from './notificationService';
import SettingService from './settingService';
import TaxonomyService from './taxonomyService';
import TorrentService from './torrentService';

import DelugeClientGatewayService from './Deluge/clientGatewayService';
import QBittorrentClientGatewayService from './qBittorrent/clientGatewayService';
import RTorrentClientGatewayService from './rTorrent/clientGatewayService';
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

export const destroyUserServices = (userId: UserInDatabase['_id']) => {
  const userServiceInstances = serviceInstances[userId];
  delete serviceInstances[userId];
  Object.keys(userServiceInstances).forEach((key) => {
    const serviceName = key as keyof ServiceInstances;
    userServiceInstances[serviceName].destroy();
  });
};

export const bootstrapServicesForUser = (user: UserInDatabase) => {
  const {_id} = user;

  if (serviceInstances[_id] != null) {
    destroyUserServices(_id);
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
