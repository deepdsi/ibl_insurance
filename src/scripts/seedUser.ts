import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ibl_insurance';
  await mongoose.connect(uri);

  const email = process.env.SEED_EMAIL || 'admin@example.com';
  const password = process.env.SEED_PASSWORD || 'Admin123!';
  const role = (process.env.SEED_ROLE as any) || 'admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User already exists:', email);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName: 'Seed User', email, passwordHash, role, isActive: true });

  console.log('Created user:', { id: user._id.toString(), email: user.email, role: user.role });
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
