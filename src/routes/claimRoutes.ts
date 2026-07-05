import { Request, Router } from 'express';
import Claim from '../models/Claim';
import { calculateCoverage } from '../utils/policy';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { upload } from '../utils/upload';
import { parseLineItemsInput } from '../utils/claimPayload';

const router = Router();

router.post('/', requireAuth(['provider']), upload.array('documents', 5), async (req: Request, res) => {
  try {
    const authReq = req as AuthRequest;
    const { patientName, policyNumber, dateOfBirth, procedureName, procedureCode, dateOfService, lineItems } = req.body;
    const providerId = authReq.user?.id;
    const parsedLineItems = parseLineItemsInput(lineItems);
    const totalAmount = parsedLineItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const coverage = calculateCoverage(totalAmount);

    const claim = await Claim.create({
      providerId,
      patientName,
      policyNumber,
      dateOfBirth,
      procedureName,
      procedureCode,
      dateOfService,
      lineItems: parsedLineItems,
      totalAmount,
      supportingDocuments: req.files ? (req.files as Express.Multer.File[]).map((file) => file.filename) : [],
      coveredAmount: coverage.coveredAmount,
      patientResponsibility: coverage.patientResponsibility,
      auditTrail: [{ changedBy: providerId, action: 'Submitted claim', reason: 'Initial submission' }],
    });

    res.status(201).json(claim);
  } catch (error) {
    console.error('Create claim failed:', error);
    res.status(500).json({ message: 'Failed to create claim', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/', requireAuth(['provider', 'reviewer', 'admin']), async (req: Request, res) => {
  const authReq = req as AuthRequest;
  const claims = authReq.user?.role === 'provider'
    ? await Claim.find({ providerId: authReq.user.id }).sort({ createdAt: -1 })
    : await Claim.find().sort({ createdAt: -1 });
  res.json(claims);
});

router.get('/:id', requireAuth(['provider', 'reviewer', 'admin']), async (req: Request, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // If provider requests, ensure they own the claim
    const authReq = req as AuthRequest;
    if (authReq.user?.role === 'provider' && claim.providerId.toString() !== authReq.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(claim);
  } catch (error) {
    console.error('Get claim failed:', error);
    res.status(500).json({ message: 'Failed to get claim', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/:id/review', requireAuth(['reviewer', 'admin']), async (req: Request, res) => {
  try {
    const { status, reviewerNotes, rejectionReason, changedBy } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;
    claim.reviewerNotes = reviewerNotes;
    claim.rejectionReason = rejectionReason;
    claim.auditTrail.push({ changedBy, action: `Status changed to ${status}`, timestamp: new Date(), reason: reviewerNotes || rejectionReason });
    await claim.save();

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update claim' });
  }
});

export default router;
