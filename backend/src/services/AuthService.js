import jwt from 'jsonwebtoken';

export class AuthService {
  #secret;
  #username;
  #password;

  constructor() {
    this.#secret   = process.env.JWT_SECRET   || 'change-me-in-production';
    this.#username = process.env.AUTH_USERNAME || 'admin';
    this.#password = process.env.AUTH_PASSWORD || 'admin';
  }

  validate(username, password) {
    return username === this.#username && password === this.#password;
  }

  sign() {
    return jwt.sign({ sub: this.#username }, this.#secret, { expiresIn: '24h' });
  }

  verify(token) {
    try {
      return jwt.verify(token, this.#secret);
    } catch {
      return null;
    }
  }
}

export default new AuthService();
