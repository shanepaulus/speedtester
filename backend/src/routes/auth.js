import { Router } from 'express';
import authService from '../services/AuthService.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (!authService.validate(username, password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ token: authService.sign() });
});

export default router;
