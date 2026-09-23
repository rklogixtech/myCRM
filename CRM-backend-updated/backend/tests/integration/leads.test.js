const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Lead = require('../../src/models/Lead');
const jwt = require('../../src/utils/jwt');

let mongoServer;

// Setup in-memory MongoDB before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clean up data between tests
beforeEach(async () => {
  await User.deleteMany({});
  await Lead.deleteMany({});
});

// Disconnect and stop in-memory MongoDB after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/leads', () => {
  const validLeadData = {
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '1234567890',
    company: 'Acme Inc',
    source: 'website',
    status: 'new',
  };

  const createUser = async (role = 'sales') => {
    const user = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role,
    });
    return user;
  };

  const getTokenForUser = (user) => {
    const payload = { id: user._id, email: user.email, role: user.role };
    return jwt.generateAccessToken(payload);
  };

  // ─── 201 Created ──────────────────────────────────────────────
  it('should create a lead and return 201 for authorized sales user', async () => {
    const user = await createUser('sales');
    const token = getTokenForUser(user);

    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send(validLeadData)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.name).toBe('Alice Smith');
    expect(res.body.data.email).toBe('alice@example.com');
  });

  it('should create a lead and return 201 for authorized admin user', async () => {
    const user = await createUser('admin');
    const token = getTokenForUser(user);

    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send(validLeadData)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
  });

  // ─── 400 Validation Error ──────────────────────────────────────
  it('should return 400 when required fields are missing', async () => {
    const user = await createUser('sales');
    const token = getTokenForUser(user);

    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({}) // missing required fields
      .expect(400);

    expect(res.body.success).toBe(false);
    // Should be a validation error - either "Validation failed" or Joi error message
    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 when email is invalid', async () => {
    const user = await createUser('sales');
    const token = getTokenForUser(user);

    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...validLeadData,
        email: 'not-an-email',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  // ─── 401 Unauthorized ──────────────────────────────────────────
  it('should return 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/leads')
      .send(validLeadData)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no token|unauthorized/i);
  });

  it('should return 401 when an invalid token is provided', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', 'Bearer invalid-token-here')
      .send(validLeadData)
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  // ─── 403 Forbidden ─────────────────────────────────────────────
  it('should return 403 when user has no role (no permission)', async () => {
    // Create a user without admin/sales role — but valid roles are only admin/sales per schema.
    // In the schema, role defaults to 'sales', so we can't easily create a forbidden user via model.
    // Instead, we simulate a token with an unauthorized role by manually generating one.
    const payload = { id: new mongoose.Types.ObjectId(), email: 'viewer@example.com', role: 'viewer' };
    const token = jwt.generateAccessToken(payload);

    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send(validLeadData)
      .expect(403);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/insufficient|forbidden/i);
  });
});

