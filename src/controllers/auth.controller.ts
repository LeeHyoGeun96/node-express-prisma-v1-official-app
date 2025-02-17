import { NextFunction, Request, Response, Router } from 'express';
import auth from '../utils/auth';
import {
  createUser,
  deleteImage,
  deleteUser,
  getCurrentUser,
  login,
  updateImage,
  updatePassword,
  updateUser,
} from '../services/auth.service';
import HttpException from '../models/http-exception.model';

const router = Router();

/**
 * Create an user
 * @auth none
 * @route {POST} /users
 * @bodyparam user User
 * @returns user User
 */
router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await createUser(req.body.user);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * Login
 * @auth none
 * @route {POST} /users/login
 * @bodyparam user User
 * @returns user User
 */
router.post('/users/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await login(req.body.user);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * Get current user
 * @auth required
 * @route {GET} /user
 * @returns user User
 */
router.get('/user', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // 토큰에서 id를 사용
    if (!userId) {
      throw new HttpException(401, { error: { auth: ['Invalid token'] } });
    }

    const user = await getCurrentUser(userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * Update user
 * @auth required
 * @route {PUT} /user
 * @bodyparam user User
 * @returns user User
 */
router.put('/user', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // 토큰에서 id를 사용
    if (!userId) {
      throw new HttpException(401, { error: { auth: ['Invalid token'] } });
    }

    const user = await updateUser(req.body.user, userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * Update user image
 * @auth required
 * @route {PUT} /user/image
 * @bodyparam user User
 * @returns user User
 */
router.put(
  '/user/image',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // 토큰에서 id를 사용
    if (!userId) {
      throw new HttpException(401, { error: { auth: ['Invalid token'] } });
    }

    try {
      const user = await updateImage(req.body.user, userId);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * delete user Image
 * @auth required
 * @route {DELETE} /user/image
 * @returns message string
 */
router.delete(
  '/user/image',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id; // 토큰에서 id를 사용
      if (!userId) {
        throw new HttpException(401, { error: { auth: ['Invalid token'] } });
      }

      const result = await deleteImage(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Update user password
 * @auth required
 * @route {PUT} /user/password
 * @bodyparam user User
 * @returns user User
 */
router.put(
  '/user/password',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // 토큰에서 id를 사용
    if (!userId) {
      throw new HttpException(401, { error: { auth: ['Invalid token'] } });
    }

    try {
      const user = await updatePassword(req.body.user, userId);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Delete user account
 * @auth required
 * @route {DELETE} /user
 * @returns message string
 */
router.delete('/user', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // 토큰에서 id를 사용
    if (!userId) {
      throw new HttpException(401, { error: { auth: ['Invalid token'] } });
    }

    const result = await deleteUser(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
