import services from '../services';

export default (req, res, next) => {
  req.services = services.getAllServices(req.user);
  next();
};
