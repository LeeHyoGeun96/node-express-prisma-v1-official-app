import bcrypt from 'bcryptjs';
import { RegisterInput } from '../models/register-input.model';
import prisma from '../../prisma/prisma-client';
import HttpException from '../models/http-exception.model';
import { RegisteredUser } from '../models/registered-user.model';
import generateToken from '../utils/token.utils';
import { User } from '../models/user.model';

const checkUserUniqueness = async (email: string, username: string) => {
  const existingUserByEmail = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  const existingUserByUsername = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (existingUserByEmail || existingUserByUsername) {
    throw new HttpException(422, {
      error: {
        ...(existingUserByEmail ? { email: ['has already been taken'] } : {}),
        ...(existingUserByUsername ? { username: ['has already been taken'] } : {}),
      },
    });
  }
};

export const createUser = async (input: RegisterInput): Promise<RegisteredUser> => {
  const email = input.email?.trim();
  const username = input.username?.trim();
  const password = input.password?.trim();
  const { image, bio } = input;

  if (!email) {
    throw new HttpException(422, { error: { email: ["can't be blank"] } });
  }

  if (!username) {
    throw new HttpException(422, { error: { username: ["can't be blank"] } });
  }

  if (!password) {
    throw new HttpException(422, { error: { password: ["can't be blank"] } });
  }

  await checkUserUniqueness(email, username);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      ...(image ? { image } : {}),
      ...(bio ? { bio } : {}),
    },
    select: {
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return {
    ...user,
    token: generateToken(user),
  };
};

export const login = async (userPayload: any) => {
  const email = userPayload.email?.trim();
  const password = userPayload.password?.trim();

  if (!email) {
    throw new HttpException(422, { error: { email: ["can't be blank"] } });
  }

  if (!password) {
    throw new HttpException(422, { error: { password: ["can't be blank"] } });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      email: true,
      username: true,
      password: true,
      bio: true,
      image: true,
    },
  });

  if (user) {
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      return {
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
        token: generateToken(user),
      };
    }
  }

  throw new HttpException(403, {
    error: {
      'email or password': ['is invalid'],
    },
  });
};

export const getCurrentUser = async (username: string) => {
  const user = (await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  })) as User;

  return {
    ...user,
    token: generateToken(user),
  };
};

export const updateUser = async (userPayload: any, loggedInUsername: string) => {
  const { username, bio } = userPayload;

  const user = await prisma.user.update({
    where: {
      username: loggedInUsername,
    },
    data: {
      ...(username ? { username } : {}),
      ...(bio ? { bio } : {}),
    },
    select: {
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return {
    ...user,
    token: generateToken(user),
  };
};

export const updatePassword = async (userPayload: any, loggedInUsername: string) => {
  const { inputCurrentPassword, password } = userPayload;

  // 입력값 검증
  if (!inputCurrentPassword || !password) {
    throw new HttpException(400, {
      error: { password: ['Current and new password are required'] },
    });
  }

  // 새 비밀번호 유효성 검사 (예: 최소 8자 이상)
  if (password.length < 8) {
    throw new HttpException(400, {
      error: { password: ['New password must be at least 8 characters long'] },
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: loggedInUsername },
      select: { password: true },
    });

    // 사용자 존재 여부 확인
    if (!user) {
      throw new HttpException(404, { error: { user: ['User not found'] } });
    }

    const match = await bcrypt.compare(inputCurrentPassword, user.password);

    if (!match) {
      throw new HttpException(403, { error: { 'current password': ['is invalid'] } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { username: loggedInUsername },
      data: { password: hashedPassword },
      select: {
        email: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    return {
      ...updatedUser,
      token: generateToken(updatedUser),
    };
  } catch (error) {
    // Prisma 또는 기타 예상치 못한 오류 처리
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(500, { error: { server: ['An unexpected error occurred'] } });
  }
};

export const updateImage = async (userPayload: any, loggedInUsername: string) => {
  const { image } = userPayload;

  if (!image) {
    throw new HttpException(400, { error: { image: ["can't be blank"] } });
  }

  const user = await prisma.user.update({
    where: {
      username: loggedInUsername,
    },
    data: {
      ...(image ? { image } : {}),
    },
    select: {
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return {
    ...user,
    token: generateToken(user),
  };
};

export const findUserIdByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new HttpException(404, { error: { user: ['User not found'] } });
  }

  return user;
};

export const deleteUser = async (loggedInUsername: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: loggedInUsername },
    });

    if (!user) {
      throw new HttpException(404, { error: { user: ['User not found'] } });
    }

    // 사용자 삭제
    await prisma.user.delete({
      where: { username: loggedInUsername },
    });

    return { message: 'User successfully deleted' };
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(500, { error: { server: ['An unexpected error occurred'] } });
  }
};
