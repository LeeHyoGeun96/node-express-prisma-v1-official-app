import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

const generateToken = (user: Partial<User>): string => {
  const now = Math.floor(Date.now() / 1000); // 현재 시간을 Unix timestamp로 변환

  const tokenPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    iat: now, // 토큰 발급 시간 (현재)
    exp: now + 60 * 60 * 24 * 60, // 60일 후 만료
  };

  return jwt.sign(tokenPayload, process.env.JWT_SECRET || 'superSecret');
};

export default generateToken;
