import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Department from './models/Department.js';
import Complaint from './models/Complaint.js';
import Authority from './models/Authority.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-calm-civic';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() });
});

// Complaints routes
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('user_id', 'name email').populate('assigned_authority_id', 'authority_name sector');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const { user_id, sector, complaint_text, location } = req.body;
    if (!user_id || !sector || !complaint_text || !location) {
      return res.status(400).json({ error: 'user_id, sector, complaint_text, and location are required' });
    }

    // AI Routing Placeholder: Find nearest authority based on sector and location
    // TODO: Implement actual AI logic for sector detection and geo-based routing
    const nearestAuthority = await Authority.findOne({
      sector: sector,
      'geo': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.geo.lng, location.geo.lat]
          }
        }
      }
    });

    if (!nearestAuthority) {
      return res.status(400).json({ error: 'No authority found for the given sector and location' });
    }

    const complaint = new Complaint({
      user_id,
      sector,
      complaint_text,
      location,
      assigned_authority_id: nearestAuthority._id,
      status: 'Pending'
    });

    await complaint.save();
    await complaint.populate('user_id', 'name email');
    await complaint.populate('assigned_authority_id', 'authority_name sector');

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Users routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ is_active: true }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({ name, email, password, phone, address });
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Departments routes
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find({ is_active: true }).populate('authority_id', 'authority_name sector').select('-password');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { departmentName, departmentType, email, phone, officerName, password, authority_id } = req.body;
    if (!departmentName || !departmentType || !email || !phone || !officerName || !password || !authority_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingDept = await Department.findOne({ email });
    if (existingDept) {
      return res.status(409).json({ error: 'Department already exists' });
    }

    const department = new Department({
      departmentName,
      departmentType,
      email,
      phone,
      officerName,
      password,
      authority_id
    });

    await department.save();
    await department.populate('authority_id', 'authority_name sector');

    const deptResponse = department.toObject();
    delete deptResponse.password;

    res.status(201).json(deptResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = await User.findOne({ email, is_active: true });
    let userType = 'user';
    if (!user) {
      user = await Department.findOne({ email, is_active: true });
      userType = 'department';
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, type: userType }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name || user.departmentName,
        email: user.email,
        type: userType
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, type: 'user' }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, type: 'user' }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
