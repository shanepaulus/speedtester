import authService from '../services/AuthService.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token || !authService.verify(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
