import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';

const loginSchema = z.object({
  email: z.string().email('valid email is required'),
  password: z.string().min(6, 'password is required'),
});

if (!config.authEmail) {
  throw new Error('[startup] AUTH_EMAIL must be configured for login.');
}

const derivePasswordHash = (): string => {
  if (config.authPasswordHash) return config.authPasswordHash;
  if (!config.authPassword) {
    throw new Error('[startup] AUTH_PASSWORD or AUTH_PASSWORD_HASH must be provided for login.');
  }
  return bcrypt.hashSync(config.authPassword, 12);
};

const hashedPassword = derivePasswordHash();

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid credentials payload', details: parsed.error.format() });
  }

  const { email, password } = parsed.data;

  if (email !== config.authEmail) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatches = await bcrypt.compare(password, hashedPassword);

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ email }, config.jwtSecret as string, { expiresIn: config.jwtExpiresIn });

  return res.json({ token, expiresIn: config.jwtExpiresIn });
});

export default authRouter;
