import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

async function seed() {
  const uri   = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL;
  const pass  = process.env.ADMIN_PASSWORD;

  if (!uri)   { console.error('MONGODB_URI not set in .env'); process.exit(1); }
  if (!email) { console.error('ADMIN_EMAIL not set in .env'); process.exit(1); }
  if (!pass)  { console.error('ADMIN_PASSWORD not set in .env'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const UserSchema = new mongoose.Schema({
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role:     { type: String, default: 'admin' },
  }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin user "${email}" already exists — skipping.`);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(pass, 10);
  await User.create({ email: email.toLowerCase(), password: hashed, role: 'admin' });
  console.log(`Admin user "${email}" created successfully.`);

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
