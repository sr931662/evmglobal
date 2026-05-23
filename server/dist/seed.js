"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function seed() {
    const uri = process.env.MONGODB_URI;
    const email = process.env.ADMIN_EMAIL;
    const pass = process.env.ADMIN_PASSWORD;
    if (!uri) {
        console.error('MONGODB_URI not set in .env');
        process.exit(1);
    }
    if (!email) {
        console.error('ADMIN_EMAIL not set in .env');
        process.exit(1);
    }
    if (!pass) {
        console.error('ADMIN_PASSWORD not set in .env');
        process.exit(1);
    }
    await mongoose_1.default.connect(uri);
    console.log('Connected to MongoDB');
    const UserSchema = new mongoose_1.default.Schema({
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: 'admin' },
    }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
    const User = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        console.log(`Admin user "${email}" already exists — skipping.`);
        await mongoose_1.default.disconnect();
        return;
    }
    const hashed = await bcrypt_1.default.hash(pass, 10);
    await User.create({ email: email.toLowerCase(), password: hashed, role: 'admin' });
    console.log(`Admin user "${email}" created successfully.`);
    await mongoose_1.default.disconnect();
}
seed().catch(err => { console.error(err); process.exit(1); });
