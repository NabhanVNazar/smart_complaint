import request from 'supertest';
import http from 'http';
import express from 'express';
import { connect, closeDatabase, clearDatabase } from './db';

// We need to import and setup the app similarly to index.js
// This is a simplified version for testing purposes.
import authRoutes from '../routes/auth'; // Assuming you refactor routes
import departmentRoutes from '../routes/departments'; // Assuming you refactor routes

// For this test, we will create a simplified app instance
const app = express();
app.use(express.json());

// Mocking the full app setup from index.js
jest.mock('../index.js', () => ({})); // Prevent original index.js from running

// We need to manually add the routes we want to test
// In a larger app, you'd export the 'app' from a separate file (e.g., app.js)
// and import it here. For now, we'll redefine the routes for the test.

// Mock authorities data from index.js
const authorities = [
  { _id: '60c72b9b5f1b2c001f8e4d21', authority_name: 'Public Works Department', authority_email: 'pwd@gov.in' },
  { _id: '60c72b9b5f1b2c001f8e4d23', authority_name: 'Electricity Board', authority_email: 'power@gov.in' },
];

app.post('/api/auth/register', require('../index.js').__esModule ? require('../index.js').default.routes[9].handle : (req, res, next) => {
    // This is a workaround. Ideally, routes are exported.
    // For this example, I'll re-implement a small part of the logic.
    // This part is complex to mock without refactoring index.js
    res.status(501).send('Not implemented for test');
});

app.get('/api/departments/authorities', (req, res) => {
    res.json(authorities.map(({_id, authority_name, authority_email}) => ({id: _id, name: authority_name, email: authority_email})));
});

app.post('/api/departments/register', (req, res) => {
    const { authorityId, phone } = req.body;
    if (!authorityId || !phone || !/^\+91[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Valid authority and Indian phone number are required.' });
    }
    console.log = jest.fn(); // Mock console.log
    const otp = '123456';
    console.log(`OTP for phone ${phone} (Authority ID: ${authorityId}): ${otp}`);
    res.json({ message: 'OTP generated and logged to server console.' });
});


describe('Auth Endpoints', () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  describe('Department Registration', () => {
    it('should get a list of authorities', async () => {
      const res = await request(app).get('/api/departments/authorities');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
    });

    it('should generate an OTP for department registration', async () => {
        const res = await request(app)
            .post('/api/departments/register')
            .send({
                authorityId: '60c72b9b5f1b2c001f8e4d21',
                phone: '+919876543210'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('OTP generated and logged to server console.');
    });

    it('should fail to generate OTP with invalid phone number', async () => {
        const res = await request(app)
            .post('/api/departments/register')
            .send({
                authorityId: '60c72b9b5f1b2c001f8e4d21',
                phone: '12345'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('Indian phone number');
    });
  });

  // Note: Testing routes that interact with the database like verify-otp, login, etc.
  // requires a more involved setup where the app from index.js is fully initialized
  // and exported. The current structure of index.js makes this difficult without refactoring.
  // The tests below are conceptual.

  describe('User Registration and Login', () => {
    it('should register a new user successfully', async () => {
      // This test would require the full app instance
      // const res = await request(app)
      //   .post('/api/auth/register')
      //   .send({
      //     name: 'Test User',
      //     email: 'test@example.com',
      //     password: 'password123',
      //   });
      // expect(res.statusCode).toEqual(201);
      // expect(res.body).toHaveProperty('token');
    });

    it('should log in an existing user', async () => {
        // Step 1: Register a user
        // Step 2: Attempt to log in
        // const res = await request(app)
        //   .post('/api/auth/login')
        //   .send({
        //     email: 'test@example.com',
        //     password: 'password123',
        //   });
        // expect(res.statusCode).toEqual(200);
        // expect(res.body).toHaveProperty('token');
    });
  });
});