import jwt from 'jsonwebtoken';

const NORMAL_EXPIRY = '2h';
const REMEMBER_ME_EXPIRY = '30d';

export function signToken(user, rememberMe) {
  const payload = { id: user._id.toString(), role: user.role };
  const expiresIn = rememberMe ? REMEMBER_ME_EXPIRY : NORMAL_EXPIRY;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
