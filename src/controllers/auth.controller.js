import { asyncHandler } from '../middleware/errorHandler.js';
import authService from '../services/auth.service.js';

// Register
export const register = asyncHandler(async (req, res) => {
  const userData = req.body;
  const result = await authService.register(userData);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Your account is pending approval by administrator.',
    data: result,
  });
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  
  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

// Refresh token
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: tokens,
  });
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await authService.getCurrentUser(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  // In a Redis setup, we would blacklist the token here
  
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});
