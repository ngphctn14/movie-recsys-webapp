import jwt from 'jsonwebtoken';
import * as authService from './auth.service.js';
import registerDto from './dto/register.dto.js';
import loginDto from './dto/login.dto.js';
import Blacklist from './blacklist.schema.js';

// Helper to set the cookie
const sendTokenResponse = (result, statusCode, res) => {
  const token = result.token;
  
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove token from JSON response (it's in the cookie now)
  const { token: _, ...userResponse } = result;

  res.status(statusCode)
    .cookie('jwt', token, options)
    .json(userResponse);
};

export const register = async (req, res) => {
  try {
    const { error, value } = registerDto.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const result = await authService.register(value);
    sendTokenResponse(result, 201, res);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { error, value } = loginDto.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const result = await authService.login(value);
    sendTokenResponse(result, 200, res);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies['jwt'];

    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        await Blacklist.create({
          token: token,
          expiresAt: new Date(decoded.exp * 1000) 
        });
      }
    }

    res.cookie('jwt', '', {
      expires: new Date(0),
      httpOnly: true
    });
    
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};