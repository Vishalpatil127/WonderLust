const ExpressError = require("../utils/ExpressError");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ExpressError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ExpressError("Forbidden: insufficient permission", 403));
    }

    next();
  };
};

module.exports = authorize;
