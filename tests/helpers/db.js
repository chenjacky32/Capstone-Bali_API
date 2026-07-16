import prisma from '../../src/config/DatabaseConfig.js';

export const cleanDb = async () => {
  await prisma.rating.deleteMany({});
  await prisma.bookmark_detail.deleteMany({});
  await prisma.users.deleteMany({});
  await prisma.destination.deleteMany({});
};
