import User from '../modules/auth/auth.model.js';
import { verifyAccessToken } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Unauthorized');
  }

  const token = authHeader.split(' ')[1];

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  if (decoded.sessionVersion !== user.sessionVersion) {
    throw new ApiError(401, 'Session expired. Please login again.');
  }

  req.user = user;
  next();
});

export default protect;
