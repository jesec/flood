module.exports = key => {
  return (req, res, next) => {
    const value = req.body && req.body[key];

    if (value && typeof value === 'string') {
      req.body[key] = value === 'true';
    }

    next();
  };
};
