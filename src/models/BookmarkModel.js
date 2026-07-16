import prisma from '../config/DatabaseConfig.js';

class BookmarkModel {
  async findMany(userId, destId) {
    return await prisma.bookmark_detail.findMany({
      where: {
        AND: [{ user_id: userId }, { dest_id: destId }],
      },
      include: {
        users: true,
        destination: true,
      },
    });
  }

  async findManyByUserId(userId, isBookmark) {
    return await prisma.bookmark_detail.findMany({
      where: {
        user_id: userId,
        isBookmark: isBookmark,
      },
      include: {
        users: true,
        destination: true,
      },
    });
  }

  async update(id, data) {
    return await prisma.bookmark_detail.update({
      where: { id },
      data,
      include: {
        users: true,
        destination: true,
      },
    });
  }

  async create(data) {
    return await prisma.bookmark_detail.create({
      data,
      include: {
        users: true,
        destination: true,
      },
    });
  }

  async deleteAll() {
    return await prisma.bookmark_detail.deleteMany({});
  }
}

export default new BookmarkModel();
