module.exports = (req, res, next) => {
  req.auth = { email: 'test@example.com' };
  next();
};
