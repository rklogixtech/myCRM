const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { UnauthorizedError, ConflictError } = require('../utils/ApiError');

exports.register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError('Email already registered');

  const user = await User.create({ name, email, password, role });

  const payload = { id: user._id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthorizedError('Invalid credentials');

  const payload = { id: user._id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

exports.refresh = async (oldRefreshToken) => {
  const decoded = verifyRefreshToken(oldRefreshToken);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== oldRefreshToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const payload = { id: user._id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

exports.logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

exports.getProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new UnauthorizedError('User not found');
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
};

exports.updateProfile = async (userId, data) => {
  const allowed = ({ name, phone, bio, avatar } = data);
  const update = {};
  if (allowed.name !== undefined) update.name = allowed.name;
  if (allowed.phone !== undefined) update.phone = allowed.phone;
  if (allowed.bio !== undefined) update.bio = allowed.bio;
  if (allowed.avatar !== undefined) update.avatar = allowed.avatar;

  const user = await User.findByIdAndUpdate(userId, update, {
    new: true,
    runValidators: true,
  }).lean();
  if (!user) throw new UnauthorizedError('User not found');

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new UnauthorizedError('User not found');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new UnauthorizedError('Current password is incorrect');
  user.password = newPassword;
  await user.save();
};

exports.listUsers = async () => {
  return User.find({ isActive: true }, 'name email role avatar').sort({ name: 1 }).lean();
};

