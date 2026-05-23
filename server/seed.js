import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  try {
    // Run migration (create tables if not exist)
    const fs = await import('fs');
    const migration = fs.readFileSync('./db/migration.sql', 'utf8');
    await pool.query(migration);
    console.log('Migration executed.');

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length > 0) {
      console.log('Admin user already exists.');
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
      [email, hashedPassword, 'admin']
    );
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();