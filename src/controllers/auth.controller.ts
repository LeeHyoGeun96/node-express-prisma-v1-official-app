import { NextFunction, Request, Response, Router } from 'express';
import auth from '../utils/auth';
import {
  createUser,
  deleteUser,
  getCurrentUser,
  login,
  updateImage,
  updatePassword,
  updateUser,
} from '../services/auth.service';

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
    const user = await getCurrentUser(req.user?.username as string);
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
    const user = await updateUser(req.body.user, req.user?.username as string);
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
    try {
      const user = await updateImage(req.body.user, req.user?.username as string);
      res.json({ user });
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
    try {
      const user = await updatePassword(req.body.user, req.user?.username as string);
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
    const result = await deleteUser(req.user?.username as string);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
