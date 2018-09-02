const services = require('../services');

module.exports = (req, res, next) => {
  req.services = services.getAllServices(req.user);
  next();
};
