import { Router } from 'express';
import User from '../models/User';
import Claim from '../models/Claim';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/users', requireAuth(['admin']), async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

router.patch('/users/:id/status', requireAuth(['admin']), async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

router.get('/claims', requireAuth(['admin']), async (_req, res) => {
  const claims = await Claim.find().sort({ createdAt: -1 });
  res.json(claims);
});

router.get('/flagged-claims', requireAuth(['admin']), async (_req, res) => {
  const claims = await Claim.find().sort({ createdAt: -1 });
  const flagged = claims.filter((claim) => claim.totalAmount > 0 && claim.totalAmount > 3 * 1000);
  res.json(flagged);
});

export default router;
