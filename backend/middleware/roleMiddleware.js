const authorizeRoles = (...roles) => {
  return (req, res, next) => {

    if (!req.user || !roles.includes(req.user.role.toLowerCase())) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions"
      });
    }

    next();
  };
};

module.exports = authorizeRoles;