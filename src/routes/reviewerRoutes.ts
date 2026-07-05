import { Router } from 'express';
import Claim from '../models/Claim';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/queue', requireAuth(['reviewer', 'admin']), async (_req, res) => {
  const claims = await Claim.find({ status: { $in: ['Submitted', 'Under Review'] } }).sort({ createdAt: -1 });
  res.json(claims);
});

router.get('/dashboard', requireAuth(['reviewer', 'admin']), async (_req, res) => {
  const claims = await Claim.find();
  const pending = claims.filter((claim) => ['Submitted', 'Under Review'].includes(claim.status)).length;
  res.json({ pendingClaims: pending, reviewedToday: 0, averageProcessingTime: 0 });
});

export default router;
