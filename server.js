
import 'dotenv/config';
import express from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const app = express();
const PORT = 3003;
const HOST = '127.0.0.1';
const DB_NAME = 'phishguard';
const USERS_COLLECTION = 'users';
const uri = process.env.MONGODB_URI;

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001'
]);

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

let client;
let db;

function isValidId(id) {
  return typeof id === 'string' && id.trim().length > 0;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function safeUser(user) {
  const {
    passwordHash,
    _id,
    ...result
  } = user;

  return result;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  if (!uri) {
    console.error('MONGODB_URI পাওয়া যায়নি। .env ফাইল চেক করো।');
    process.exit(1);
  }

  client = new MongoClient(uri);

  try {
    await client.connect();
    db = client.db(DB_NAME);

    await db.collection(USERS_COLLECTION).createIndex(
      { id: 1 },
      { unique: true }
    );

    await db.command({ ping: 1 });
    console.log('MongoDB connected successfully!');

    app.post('/api/auth/register', async (req, res) => {
      try {
        const username =
          typeof req.body.username === 'string'
            ? req.body.username.trim()
            : '';

        const email =
          typeof req.body.email === 'string'
            ? req.body.email.trim().toLowerCase()
            : '';

        const password = req.body.password;

        if (
          !username ||
          !email ||
          typeof password !== 'string' ||
          password.length < 8
        ) {
          return res.status(400).json({
            error:
              'Username, email and password (at least 8 characters) are required.'
          });
        }

        const users = db.collection(USERS_COLLECTION);

        const existingUser = await users.findOne({
          $or: [
            { email },
            {
              username: {
                $regex: `^${escapeRegex(username)}$`,
                $options: 'i'
              }
            }
          ]
        });

        if (existingUser) {
          return res.status(409).json({
            error: 'Email or username already exists.'
          });
        }

        const now = new Date().toISOString();
        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = {
          id: `usr_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          username,
          email,
          role: 'user',
          passwordHash,
          createdAt: now,
          organization: 'Verified Cyber Analyst',
          securityClearance: 'Security Analyst L1',
          lastLogin: now
        };

        await users.insertOne(newUser);

        return res.status(201).json({
          success: true,
          user: safeUser(newUser)
        });
      } catch (error) {
        console.error('Registration failed:', error.message);
        return res.status(500).json({
          error: 'Registration failed.'
        });
      }
    });

    app.post('/api/auth/login', async (req, res) => {
      try {
        const email =
          typeof req.body.email === 'string'
            ? req.body.email.trim().toLowerCase()
            : '';

        const username =
          typeof req.body.username === 'string'
            ? req.body.username.trim()
            : '';

        const password = req.body.password;

        if (
          (!email && !username) ||
          typeof password !== 'string'
        ) {
          return res.status(400).json({
            error: 'Email or username and password are required.'
          });
        }

        const conditions = [];

        if (email) {
          conditions.push({ email });
        }

        if (username) {
          conditions.push({
            username: {
              $regex: `^${escapeRegex(username)}$`,
              $options: 'i'
            }
          });
        }

        const users = db.collection(USERS_COLLECTION);
        const user = await users.findOne({
          $or: conditions
        });

        if (
          !user ||
          !user.passwordHash ||
          !(await bcrypt.compare(password, user.passwordHash))
        ) {
          return res.status(401).json({
            error: 'Invalid email/username or password.'
          });
        }

        const lastLogin = new Date().toISOString();

        await users.updateOne(
          { id: user.id },
          { $set: { lastLogin } }
        );

        return res.json({
          success: true,
          user: {
            ...safeUser(user),
            lastLogin
          }
        });
      } catch (error) {
        console.error('Login failed:', error.message);
        return res.status(500).json({
          error: 'Login failed.'
        });
      }
    });

    app.get('/api/users', async (_req, res) => {
      try {
        const users = await db
          .collection(USERS_COLLECTION)
          .find({}, { projection: { passwordHash: 0 } })
          .limit(500)
          .toArray();

        return res.json(users);
      } catch (error) {
        console.error('Could not fetch users:', error.message);
        return res.status(500).json({
          error: 'Could not fetch users.'
        });
      }
    });

    // Local testing endpoint; do not expose publicly without authentication.
    app.post('/api/users', async (req, res) => {
      try {
        const user = req.body;

        if (
          !user ||
          !isValidId(user.id) ||
          typeof user.email !== 'string' ||
          typeof user.username !== 'string' ||
          !['admin', 'user'].includes(user.role)
        ) {
          return res.status(400).json({
            error: 'Invalid user data.'
          });
        }

        const { passwordHash, _id, ...safeInput } = user;
        delete safeInput.role;

        const result = await db
          .collection(USERS_COLLECTION)
          .updateOne(
            { id: user.id },
            {
              $setOnInsert: {
                ...safeInput,
                role: 'user'
              }
            },
            { upsert: true }
          );

        return res.json({
          success: true,
          inserted: result.upsertedCount === 1
        });
      } catch (error) {
        console.error('Could not save user:', error.message);
        return res.status(500).json({
          error: 'Could not save user.'
        });
      }
    });

    app.get('/api/scans', async (_req, res) => {
      try {
        const scans = await db
          .collection('scans')
          .find({})
          .sort({ timestamp: -1 })
          .limit(500)
          .toArray();

        return res.json(scans);
      } catch (error) {
        console.error('Could not fetch scans:', error.message);
        return res.status(500).json({
          error: 'Could not fetch scans.'
        });
      }
    });

    app.post('/api/scans', async (req, res) => {
      try {
        const scan = req.body;

        if (
          !scan ||
          !isValidId(scan.id) ||
          !isValidId(scan.userId) ||
          typeof scan.userEmail !== 'string' ||
          typeof scan.title !== 'string' ||
          ![
            'email',
            'url',
            'qr',
            'screenshot',
            'ai_image',
            'message'
          ].includes(scan.type) ||
          !['safe', 'suspicious', 'phishing'].includes(scan.threatLevel)
        ) {
          return res.status(400).json({
            error: 'Invalid scan data.'
          });
        }

        await db.collection('scans').updateOne(
          { id: scan.id },
          { $setOnInsert: scan },
          { upsert: true }
        );

        return res.status(201).json({ success: true });
      } catch (error) {
        console.error('Could not save scan:', error.message);
        return res.status(500).json({
          error: 'Could not save scan.'
        });
      }
    });

    app.listen(PORT, HOST, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error.message);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  await client?.close().catch(() => {});
  process.exit(0);
});
