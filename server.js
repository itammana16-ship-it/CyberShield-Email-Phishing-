
import 'dotenv/config';
import express from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();

const PORT = process.env.PORT || 3003;
const HOST = '0.0.0.0';
const DB_NAME = 'phishguard';
const USERS_COLLECTION = 'users';
const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://cybershield-email-phishing.onrender.com'
]);

// CORS configuration
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

app.use(express.json({ limit: '1mb' }));

let client;
let db;

function isValidId(id) {
  return typeof id === 'string' && id.trim().length > 0;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function safeUser(user) {
  const { passwordHash, _id, ...result } = user;
  return result;
}

// JWT authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Access token required.'
    });
  }

  try {
    req.authUser = jwt.verify(token, JWT_SECRET);

    next();
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired token.'
    });
  }
}

// Admin-only authorization
function requireAdmin(req, res, next) {
  if (req.authUser?.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required.'
    });
  }

  next();
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  if (!uri) {
    console.error('MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error('JWT_SECRET is missing or too short.');
    process.exit(1);
  }

  client = new MongoClient(uri);

  try {
    await client.connect();

    db = client.db(DB_NAME);

    const usersCollection = db.collection(USERS_COLLECTION);

    await usersCollection.createIndex(
      { id: 1 },
      { unique: true }
    );

    await db.command({ ping: 1 });

    console.log('MongoDB connected successfully!');

    // Register
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

        const existingUser = await usersCollection.findOne({
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

        await usersCollection.insertOne(newUser);

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

    // Login
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

        const user = await usersCollection.findOne({
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

        await usersCollection.updateOne(
          { id: user.id },
          { $set: { lastLogin } }
        );

        const accessToken = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role
          },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        return res.json({
          success: true,
          accessToken,
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

    // Get users - Admin only
    app.get(
      '/api/users',
      authenticateToken,
      requireAdmin,
      async (_req, res) => {
        try {
          const users = await usersCollection
            .find({}, { projection: { passwordHash: 0 } })
            .limit(500)
            .toArray();

          return res.json(users.map(safeUser));
        } catch (error) {
          console.error('Could not fetch users:', error.message);

          return res.status(500).json({
            error: 'Could not fetch users.'
          });
        }
      }
    );

    // Create/update a basic user record - Admin only
    app.post(
      '/api/users',
      authenticateToken,
      requireAdmin,
      async (req, res) => {
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

          // Never allow this endpoint to create admin accounts.
          delete safeInput.role;

          const result = await usersCollection.updateOne(
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
      }
    );

    // Delete user - Admin only
    app.delete(
      '/api/users/:id',
      authenticateToken,
      requireAdmin,
      async (req, res) => {
        try {
          const userId = req.params.id;

          if (!isValidId(userId)) {
            return res.status(400).json({
              error: 'Invalid user ID.'
            });
          }

          if (userId === req.authUser.id) {
            return res.status(403).json({
              error: 'You cannot delete your own admin account.'
            });
          }

          const targetUser = await usersCollection.findOne({
            id: userId
          });

          if (!targetUser) {
            return res.status(404).json({
              error: 'User not found.'
            });
          }

          if (targetUser.role === 'admin') {
            return res.status(403).json({
              error: 'Admin accounts cannot be deleted.'
            });
          }

          await usersCollection.deleteOne({
            id: userId,
            role: { $ne: 'admin' }
          });

          return res.json({
            success: true,
            message: 'User deleted successfully.'
          });
        } catch (error) {
          console.error('Could not delete user:', error.message);

          return res.status(500).json({
            error: 'Could not delete user.'
          });
        }
      }
    );

    // Get scans
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

    // Save a scan
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
          !['safe', 'suspicious', 'phishing'].includes(
            scan.threatLevel
          )
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

        return res.status(201).json({
          success: true
        });
      } catch (error) {
        console.error('Could not save scan:', error.message);

        return res.status(500).json({
          error: 'Could not save scan.'
        });
      }
    });

    app.listen(PORT, HOST, () => {
      console.log(`Backend listening on ${HOST}:${PORT}`);
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
