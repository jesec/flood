const ClientGatewayService = require('./clientGatewayService');
const ClientRequestManager = require('./clientRequestManager');
const FeedService = require('./feedService');
const HistoryService = require('./historyService');
const NotificationService = require('./notificationService');
const TaxonomyService = require('./taxonomyService');
const TorrentService = require('./torrentService');

const clientRequestManagers = new Map();
const clientGatewayServices = new Map();
const feedServices = new Map();
const historyServices = new Map();
const notificationServices = new Map();
const taxonomyServices = new Map();
const torrentServices = new Map();
const allServiceMaps = [
  clientRequestManagers,
  clientGatewayServices,
  feedServices,
  historyServices,
  notificationServices,
  taxonomyServices,
  torrentServices,
];

const getService = ({servicesMap, service: Service, user}) => {
  let serviceInstance = servicesMap.get(user._id);
  if (!serviceInstance) {
    // eslint-disable-next-line no-use-before-define
    serviceInstance = new Service(user, getAllServices(user));
    servicesMap.set(user._id, serviceInstance);
  }

  return serviceInstance;
};

const getClientRequestManager = user =>
  getService({servicesMap: clientRequestManagers, service: ClientRequestManager, user});

const getClientGatewayService = user =>
  getService({servicesMap: clientGatewayServices, service: ClientGatewayService, user});

const getFeedService = user => getService({servicesMap: feedServices, service: FeedService, user});

const getHistoryService = user => getService({servicesMap: historyServices, service: HistoryService, user});

const getNotificationService = user =>
  getService({servicesMap: notificationServices, service: NotificationService, user});

const getTaxonomyService = user => getService({servicesMap: taxonomyServices, service: TaxonomyService, user});

const getTorrentService = user => getService({servicesMap: torrentServices, service: TorrentService, user});

const bootstrapServicesForUser = user => {
  getClientRequestManager(user);
  getClientGatewayService(user);
  getFeedService(user);
  getHistoryService(user);
  getNotificationService(user);
  getTaxonomyService(user);
  getTorrentService(user);
};

const destroyUserServices = user => {
  const userId = user._id;
  allServiceMaps.forEach(serviceMap => {
    const userService = serviceMap.get(userId);
    if (userService != null) {
      userService.destroy();
      serviceMap.delete(userId);
    }
  });
};

const getAllServices = user => ({
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
});

const updateUserServices = user => {
  const userId = user._id;
  allServiceMaps.forEach(serviceMap => {
    const service = serviceMap.get(userId);
    if (service != null) {
      service.updateUser(user);
      serviceMap.delete(userId);
    }
  });
};

module.exports = {
  bootstrapServicesForUser,
  destroyUserServices,
  getAllServices,
  getClientRequestManager,
  getClientGatewayService,
  getHistoryService,
  getNotificationService,
  getTaxonomyService,
  getTorrentService,
  updateUserServices,
};
