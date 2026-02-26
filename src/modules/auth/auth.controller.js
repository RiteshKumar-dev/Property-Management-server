import User from './auth.model.js';
import { generateAccessToken } from '../../utils/jwt.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  return res.status(201).json(new ApiResponse(201, null, 'User registered successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(400, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(400, 'Invalid credentials');
  }

  user.sessionVersion += 1;
  user.lastLoginAt = new Date();
  await user.save();

  const token = generateAccessToken(user);

  return res.status(200).json(new ApiResponse(200, { token }, 'Login successful'));
});

export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.sessionVersion += 1;
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});
