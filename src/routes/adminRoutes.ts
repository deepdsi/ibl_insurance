import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Claim from '../models/Claim';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { objectIdSchema, sendValidationError, updateUserStatusSchema } from '../utils/validation';

const router = Router();

router.get('/users', requireAuth(['admin']), async (_req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
});

router.patch('/users/:id/status', requireAuth(['admin']), async (req, res) => {
  const authReq = req as AuthRequest;
  const parsedParams = objectIdSchema.safeParse(req.params.id);
  if (!parsedParams.success) {
    return sendValidationError(res, parsedParams.error);
  }

  const parsedBody = updateUserStatusSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return sendValidationError(res, parsedBody.error);
  }

  const { isActive } = parsedBody.data;

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
  const claimsByProcedure = claims.reduce<Record<string, typeof claims>>((groups, claim) => {
    const procedureCode = claim.procedureCode.trim().toUpperCase();
    groups[procedureCode] = [...(groups[procedureCode] || []), claim];
    return groups;
  }, {});

  const flagged = claims.flatMap((claim) => {
    const procedureCode = claim.procedureCode.trim().toUpperCase();
    const matchingClaims = claimsByProcedure[procedureCode] || [];
    const peerClaims = matchingClaims.filter((item) => item._id.toString() !== claim._id.toString());

    if (peerClaims.length === 0) {
      return [];
    }

    const averageAmount = peerClaims.reduce((sum, item) => sum + item.totalAmount, 0) / peerClaims.length;
    const thresholdAmount = averageAmount * 3;

    if (claim.totalAmount <= thresholdAmount) {
      return [];
    }

    return [{
      ...claim.toObject(),
      fraudFlag: {
        averageAmount,
        thresholdAmount,
        reason: 'Claim amount is more than 3x the average for the same procedure code',
      },
    }];
  });

  res.json(flagged);
});

export default router;
