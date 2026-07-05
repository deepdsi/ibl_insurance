import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullName, email, passwordHash, role: role || 'provider' });

    res.status(201).json({ user: { id: newUser._id, email: newUser.email, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });

    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to login' });
  }
});

export default router;
