module.exports = (req, res, next) => {
  req.auth = { 'https://yourapp.com/email': 'test@example.com' };
  req.user = { 'https://yourapp.com/email': 'test@example.com' };
  next();
};
