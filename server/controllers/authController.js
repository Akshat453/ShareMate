import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateRandomToken } from '../utils/tokenUtils.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // FIXED — return 409 for duplicate email (was 400)
      return res.status(409).json({ success: false, message: 'Email already registered.', errors: [] });
    }

    const verificationToken = generateRandomToken();
    const user = new User({
      name,
      email,
      passwordHash: password,
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();

    // In production, send verification email here
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // FIXED — sameSite 'lax' instead of 'strict' for cross-port dev cookies
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: { user: user.toPublicJSON(), accessToken },
      message: 'Registration successful.',
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.', errors: [] });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.', errors: [] });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // FIXED — sameSite 'lax' instead of 'strict' for cross-port dev cookies
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: { user: user.toPublicJSON(), accessToken },
      message: 'Login successful.',
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token not found.', errors: [] });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.', errors: [] });
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    const newRefreshToken = generateRefreshToken(user._id);
    const newAccessToken = generateAccessToken(user._id);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // FIXED — sameSite 'lax' instead of 'strict' for cross-port dev cookies
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
      message: 'Token refreshed.',
      errors: [],
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token.', errors: [] });
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== token);
        await user.save();
      }
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, data: null, message: 'Logged out.', errors: [] });
  } catch (error) {
    res.clearCookie('refreshToken');
    res.json({ success: true, data: null, message: 'Logged out.', errors: [] });
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user: user.toPublicJSON() }, message: '', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.', errors: [] });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();
    res.json({ success: true, data: null, message: 'Email verified successfully.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, data: null, message: 'If email exists, reset link has been sent.', errors: [] });
    }
    user.resetPasswordToken = generateRandomToken();
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    // In production, send reset email here
    res.json({ success: true, data: null, message: 'If email exists, reset link has been sent.', errors: [] });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.', errors: [] });
    }
    user.passwordHash = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = [];
    await user.save();
    res.json({ success: true, data: null, message: 'Password reset successful.', errors: [] });
  } catch (error) {
    next(error);
  }
};
