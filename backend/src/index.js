import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() });
});

// Example complaints routes scaffold
const complaints = [];
let idCounter = 1;

app.get('/api/complaints', (_req, res) => {
  res.json(complaints);
});

app.post('/api/complaints', (req, res) => {
  const { title, description, location, status = 'pending' } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }
  const complaint = { id: idCounter++, title, description, location, status, createdAt: new Date().toISOString() };
  complaints.push(complaint);
  res.status(201).json(complaint);
});

// Users routes
const users = [];
let userIdCounter = 1;

app.get('/api/users', (_req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id: userIdCounter++, name, email, phone, address, password: hashedPassword };
  users.push(user);
  res.status(201).json(user);
});

// Departments routes
const departments = [];
let deptIdCounter = 1;

app.get('/api/departments', (_req, res) => {
  res.json(departments);
});

app.post('/api/departments', (req, res) => {
  const { departmentName, departmentType, email, phone, officerName, password } = req.body;
  if (!departmentName || !departmentType || !email || !phone || !officerName || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const existingDept = departments.find(d => d.email === email);
  if (existingDept) {
    return res.status(409).json({ error: 'Department already exists' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const department = {
    id: deptIdCounter++,
    name: departmentName,
    departmentName,
    departmentType,
    email,
    phone,
    officerName,
    password: hashedPassword
  };
  departments.push(department);
  res.status(201).json(department);
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  let user = users.find(u => u.email === email);
  let userType = 'user';
  if (!user) {
    user = departments.find(d => d.email === email);
    userType = 'department';
  }
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, type: userType }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name || user.departmentName, email: user.email, type: userType } });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id: userIdCounter++, name, email, password: hashedPassword };
  users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ message: 'Registration successful', token, user: { id: user.id, name: user.name, email: user.email } });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
