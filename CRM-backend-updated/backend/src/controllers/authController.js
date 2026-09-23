const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  res.json({ success: true, data: result });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res.json({ success: true, message: 'Logged out successfully' });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ success: true, data: { user } });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: { user } });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  res.json({ success: true, message: 'Password updated successfully' });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const users = await authService.listUsers();
  res.json({ success: true, data: users });
});

