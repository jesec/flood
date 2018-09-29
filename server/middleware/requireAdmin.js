module.exports = (req, res, next) => {
  if (req.user == null || !req.user.isAdmin) {
    return res
      .status(403)
      .json({message: 'User is not admin.'})
      .send();
  }
  next();
};
