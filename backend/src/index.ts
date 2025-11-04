import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() });
});

// Example complaints routes scaffold
const complaints: { id: number; title: string; description: string }[] = [];
let idCounter = 1;

app.get('/api/complaints', (_req, res) => {
  res.json(complaints);
});

app.post('/api/complaints', (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }
  const complaint = { id: idCounter++, title, description };
  complaints.push(complaint);
  res.status(201).json(complaint);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
