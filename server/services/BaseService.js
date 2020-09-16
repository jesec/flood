import EventEmitter from 'events';

class BaseService extends EventEmitter {
  constructor(user, services, ...eventEmitterConfig) {
    super(...eventEmitterConfig);
    if (!user || !user._id) throw new Error('Missing user ID');
    this.user = user;
    this.services = services;
  }

  destroy() {
    delete this.services;
    delete this.user;
  }

  updateUser(user, services) {
    this.user = user;
    this.services = services;
  }
}

export default BaseService;
