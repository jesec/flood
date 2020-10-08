import type {UserInDatabase} from '@shared/schema/Auth';

import ClientGatewayService from './rTorrent/clientGatewayService';
import ClientRequestManager from './rTorrent/clientRequestManager';
import FeedService from './feedService';
import HistoryService from './historyService';
import NotificationService from './notificationService';
import TaxonomyService from './taxonomyService';
import TorrentService from './torrentService';

type Service =
  | typeof ClientGatewayService
  | typeof ClientRequestManager
  | typeof FeedService
  | typeof HistoryService
  | typeof NotificationService
  | typeof TaxonomyService
  | typeof TorrentService;

const serviceInstances: {
  clientGatewayServices: Record<string, ClientGatewayService>;
  clientRequestManagers: Record<string, ClientRequestManager>;
  feedServices: Record<string, FeedService>;
  historyServices: Record<string, HistoryService>;
  notificationServices: Record<string, NotificationService>;
  taxonomyServices: Record<string, TaxonomyService>;
  torrentServices: Record<string, TorrentService>;
} = {
  clientGatewayServices: {},
  clientRequestManagers: {},
  feedServices: {},
  historyServices: {},
  notificationServices: {},
  taxonomyServices: {},
  torrentServices: {},
};

type ServiceMap = keyof typeof serviceInstances;

const getService = <S extends Service>(servicesMap: ServiceMap, Service: S, user: UserInDatabase): InstanceType<S> => {
  // if a service instance for user exists, return it
  const serviceInstance = serviceInstances[servicesMap][user._id];
  if (serviceInstance != null) {
    return serviceInstance as InstanceType<S>;
  }

  // otherwise, create a new service instance and return it
  const newInstance = new Service(user) as InstanceType<S>;
  serviceInstances[servicesMap][user._id] = newInstance;
  return newInstance;
};

const getClientRequestManager = (user: UserInDatabase) => {
  return getService('clientRequestManagers', ClientRequestManager, user);
};

const getClientGatewayService = (user: UserInDatabase) => {
  return getService('clientGatewayServices', ClientGatewayService, user);
};

const getFeedService = (user: UserInDatabase): FeedService => {
  return getService('feedServices', FeedService, user);
};

const getHistoryService = (user: UserInDatabase): HistoryService => {
  return getService('historyServices', HistoryService, user);
};

const getNotificationService = (user: UserInDatabase): NotificationService => {
  return getService('notificationServices', NotificationService, user);
};

const getTaxonomyService = (user: UserInDatabase): TaxonomyService => {
  return getService('taxonomyServices', TaxonomyService, user);
};

const getTorrentService = (user: UserInDatabase): TorrentService => {
  return getService('torrentServices', TorrentService, user);
};

const getAllServices = (user: UserInDatabase) =>
  ({
    get clientRequestManager() {
      return getClientRequestManager(user);
    },

    get clientGatewayService() {
      return getClientGatewayService(user);
    },

    get feedService() {
      return getFeedService(user);
    },

    get historyService() {
      return getHistoryService(user);
    },

    get notificationService() {
      return getNotificationService(user);
    },

    get taxonomyService() {
      return getTaxonomyService(user);
    },

    get torrentService() {
      return getTorrentService(user);
    },
  } as const);

const createUserServices = (user: UserInDatabase): boolean => {
  return !Object.values(getAllServices(user)).some((service) => {
    if (service == null) {
      return true;
    }
    return false;
  });
};

const destroyUserServices = (userId: UserInDatabase['_id']) => {
  Object.keys(serviceInstances).forEach((key) => {
    const serviceMap = key as keyof typeof serviceInstances;
    const userService = serviceInstances[serviceMap][userId];
    if (userService != null) {
      delete serviceInstances[serviceMap][userId];
      userService.destroy();
    }
  });
};

const linkUserServices = (user: UserInDatabase) => {
  Object.keys(serviceInstances).forEach((key) => {
    const serviceMap = key as ServiceMap;
    const service = serviceInstances[serviceMap][user._id];
    if (service != null) {
      service.updateServices(getAllServices(user));
    }
  });
};

const bootstrapServicesForUser = (user: UserInDatabase) => {
  if (createUserServices(user) === false) {
    console.error(`Failed to initialize services for user ${user.username}`);
    return;
  }
  linkUserServices(user);
};

export type UserServices = ReturnType<typeof getAllServices>;

export default {
  bootstrapServicesForUser,
  destroyUserServices,
  getAllServices,
  getClientRequestManager,
  getClientGatewayService,
  getHistoryService,
  getNotificationService,
  getTaxonomyService,
  getTorrentService,
};
