import { Router } from 'express';
import {
  handleLogin,
  handleSignUp,
  handleLogout,
  handleRefreshToken,
  handleVerifyAccessToken,
} from '../providers/auth.provider';

const authController = Router();

authController.post('/login', (req, res, next) => {
  handleLogin(req, res).catch(next);
});

authController.post('/signup', (req, res, next) => {
  handleSignUp(req, res).catch(next);
});

authController.post('/refresh_token', (req, res, next) => {
  handleRefreshToken(req, res).catch(next);
});

authController.post('/validate_accessToken', (req, res, next) => {
  handleVerifyAccessToken(req, res).catch(next);
});

authController.post('/logout', (req, res, next) => {
  handleLogout(req, res).catch(next);
});

export default authController;
