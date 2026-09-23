const authService = require('../../src/services/authService');
const User = require('../../src/models/User');
const jwt = require('../../src/utils/jwt');
const { ConflictError, UnauthorizedError } = require('../../src/utils/ApiError');

// Mock the User model
jest.mock('../../src/models/User');

// Mock jwt utils
jest.mock('../../src/utils/jwt', () => ({
  generateAccessToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
  verifyRefreshToken: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Register ──────────────────────────────────────────────────
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUserData = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'sales',
        save: jest.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'user123', name: 'John Doe', email: 'john@example.com', role: 'sales' }),
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUserData);

      const result = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'sales',
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(User.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'sales',
      });
      expect(jwt.generateAccessToken).toHaveBeenCalled();
      expect(jwt.generateRefreshToken).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result.user).toHaveProperty('email', 'john@example.com');
    });

    it('should throw ConflictError when email already exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'existing', email: 'john@example.com' });

      await expect(
        authService.register({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(ConflictError);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(User.create).not.toHaveBeenCalled();
    });
  });

// ─── Login ─────────────────────────────────────────────────────
  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'sales',
        refreshToken: null,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      // findOne returns a query chain that has .select() which returns the user
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await authService.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(jwt.generateAccessToken).toHaveBeenCalled();
      expect(jwt.generateRefreshToken).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
    });

    it('should throw UnauthorizedError when user not found', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when password is wrong', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  // ─── Refresh Token ─────────────────────────────────────────────
  describe('refresh', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      const decodedPayload = { id: 'user123', email: 'john@example.com', role: 'sales' };
      jwt.verifyRefreshToken.mockReturnValue(decodedPayload);

      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        role: 'sales',
        refreshToken: 'valid-refresh-token',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findById.mockResolvedValue(mockUser);

      const result = await authService.refresh('valid-refresh-token');

      expect(jwt.verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(jwt.generateAccessToken).toHaveBeenCalled();
      expect(jwt.generateRefreshToken).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
    });

    it('should throw an error when refresh token is invalid', async () => {
      jwt.verifyRefreshToken.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      await expect(authService.refresh('invalid-refresh-token')).rejects.toThrow('jwt malformed');
    });

    it('should throw UnauthorizedError when user not found or token mismatch', async () => {
      const decodedPayload = { id: 'user123' };
      jwt.verifyRefreshToken.mockReturnValue(decodedPayload);
      User.findById.mockResolvedValue(null);

      await expect(authService.refresh('some-refresh-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when stored token does not match', async () => {
      const decodedPayload = { id: 'user123' };
      jwt.verifyRefreshToken.mockReturnValue(decodedPayload);

      const mockUser = {
        _id: 'user123',
        refreshToken: 'different-token',
      };

      User.findById.mockResolvedValue(mockUser);

      await expect(authService.refresh('some-refresh-token')).rejects.toThrow(UnauthorizedError);
    });
  });

  // ─── Logout ────────────────────────────────────────────────────
  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      User.findByIdAndUpdate.mockResolvedValue({ _id: 'user123' });

      await authService.logout('user123');

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user123', { refreshToken: null });
    });
  });
});

