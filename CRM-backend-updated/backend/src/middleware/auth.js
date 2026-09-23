const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);
  req.user = decoded;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
};

module.exports = { authenticate, authorize };

