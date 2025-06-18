module.exports = (req, res, next) => {
  req.auth = { sub: 'auth0|mockuserid' };
  next();
};
