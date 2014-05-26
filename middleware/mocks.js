var mocksMiddleware = function (req, res, next) {
  req.method = 'GET';
  next();
};

module.exports = mocksMiddleware;
