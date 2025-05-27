import { Router } from 'express';
import {
  requestTokenReset,
  resetUserPassword,
} from '../providers/password.provider';

const router = Router();

router.post('/request-reset', (req, res, next) => {
  requestTokenReset(req, res).catch(next);
});
router.post('/reset', (req, res, next) => {
  resetUserPassword(req, res).catch(next);
});

export default router;
