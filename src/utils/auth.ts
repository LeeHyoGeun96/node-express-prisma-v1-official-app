import dotenv from 'dotenv';
import path from 'path';

const jwt = require('express-jwt');

// 환경변수 직접 로드
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getTokenFromHeaders = (req: { headers: { authorization: string } }): string | null => {
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    const token = req.headers.authorization.split(' ')[1];
    return token;
  }
  return null;
};

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const auth = {
  required: jwt({
    secret,
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }).unless({ path: ['/api/users/login', '/api/users'] }),
  optional: jwt({
    secret,
    credentialsRequired: false,
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }),
};

export default auth;
