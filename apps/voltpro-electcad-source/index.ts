import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '2mb' }));

type Project = { id: string; name: string; createdAt: string; updatedAt: string; schemaVersion: number; data: Record<string, unknown> };
const projects = new Map<string, Project>();
const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  data: z.record(z.unknown()).optional()
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'VoltPro ElectCAD API', version: '0.1.0' }));
app.get('/api/projects', (_req, res) => res.json({ projects: [...projects.values()].map(({ id, name, createdAt, updatedAt, schemaVersion }) => ({ id, name, createdAt, updatedAt, schemaVersion })) }));
app.post('/api/projects', (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid project payload', details: parsed.error.flatten() });
  const now = new Date().toISOString();
  const project: Project = { id: randomUUID(), name: parsed.data.name, createdAt: now, updatedAt: now, schemaVersion: 1, data: parsed.data.data ?? {} };
  projects.set(project.id, project);
  return res.status(201).json({ project });
});
app.get('/api/projects/:id', (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  return res.json({ project });
});
app.put('/api/projects/:id', (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid project payload', details: parsed.error.flatten() });
  project.name = parsed.data.name;
  project.data = parsed.data.data ?? project.data;
  project.updatedAt = new Date().toISOString();
  return res.json({ project });
});
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.listen(port, () => console.log(`VoltPro ElectCAD API listening on http://localhost:${port}`));
