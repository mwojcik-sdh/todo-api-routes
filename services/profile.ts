import { prisma } from '../lib/prisma';

type CreateProfilePayload = {
  id: string;
  username: string;
};

export const ProfileService = {
  async createUserProfile(payload: CreateProfilePayload) {
    const { id, username } = payload;

    return prisma.user.create({
      data: {
        id,
        username,
      },
    });
  },
  async getUserProfile(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },
};
