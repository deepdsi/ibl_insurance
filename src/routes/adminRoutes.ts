import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Claim from '../models/Claim';
import { requireAuth, type AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/users', requireAuth(['admin']), async (_req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
});

router.patch('/users/:id/status', requireAuth(['admin']), async (req, res) => {
  const authReq = req as AuthRequest;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'isActive must be a boolean' });
  }

  if (req.params.id === authReq.user?.id && !isActive) {
    return res.status(400).json({ message: 'You cannot suspend your own admin account' });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-passwordHash');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

router.get('/claims', requireAuth(['admin']), async (_req, res) => {
  const claims = await Claim.find()
    .populate('providerId', 'fullName email role isActive')
    .sort({ createdAt: -1 });
  const claimObjects = claims.map((claim) => claim.toObject());
  const changedByIds = Array.from(new Set(
    claimObjects.flatMap((claim) => claim.auditTrail.map((entry) => entry.changedBy))
      .filter((changedBy) => mongoose.isValidObjectId(changedBy)),
  ));
  const auditUsers = await User.find({ _id: { $in: changedByIds } }).select('fullName email').lean();
  const auditUserMap = new Map(auditUsers.map((user) => [user._id.toString(), user.fullName || user.email]));

  res.json(claimObjects.map((claim) => ({
    ...claim,
    auditTrail: claim.auditTrail.map((entry) => ({
      ...entry,
      changedByFullName: auditUserMap.get(entry.changedBy),
    })),
  })));
});

router.get('/flagged-claims', requireAuth(['admin']), async (_req, res) => {
  const claims = await Claim.find().sort({ createdAt: -1 });
  const flagged = claims.filter((claim) => claim.totalAmount > 0 && claim.totalAmount > 3 * 1000);
  res.json(flagged);
});

export default router;
