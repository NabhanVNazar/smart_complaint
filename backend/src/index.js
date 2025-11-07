import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from './config/database.js';
import User from './models/User.js';
import Department from './models/Department.js';
import Complaint from './models/Complaint.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() });
});

// Complaints routes
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('userId', 'name email').populate('departmentId', 'departmentName');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const { title, description, location, status = 'pending', department } = req.body;
    if (!title || !description || !location || !department) {
      return res.status(400).json({ error: 'title, description, location, and department are required' });
    }

    // Get user from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const complaint = new Complaint({
      title,
      description,
      location,
      status,
      department,
      userId: user._id
    });

    await complaint.save();
    await complaint.populate('userId', 'name email');

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Users routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
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

    const user = new User({
      name,
      email,
      phone,
      address,
      password,
      type: 'user'
    });

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
    const departments = await Department.find().select('-password');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { departmentName, departmentType, email, phone, officerName, password } = req.body;
    if (!departmentName || !departmentType || !email || !phone || !officerName || !password) {
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
      type: 'department'
    });

    await department.save();
    const token = jwt.sign({ id: department._id, email: department.email, type: 'department' }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: department._id,
        name: department.departmentName,
        email: department.email,
        type: 'department'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    let userType = 'user';

    if (!user) {
      user = await Department.findOne({ email });
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
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      phone,
      address,
      password,
      type: 'user'
    });

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
