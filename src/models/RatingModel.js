import prisma from '../config/DatabaseConfig.js';

class RatingModel {
  async findMany(userId, destId) {
    return await prisma.rating.findMany({
      where: {
        AND: [{ user_id: userId }, { dest_id: destId }],
      },
      include: {
        users: true,
        destination: true,
      },
    });
  }

  async update(ratingId, data) {
    return await prisma.rating.update({
      where: {
        rating_id: ratingId,
      },
      data,
      include: {
        users: true,
        destination: true,
      },
    });
  }

  async create(data) {
    return await prisma.rating.create({
      data,
      include: {
        users: true,
        destination: true,
      },
    });
  }

  async findManyByDestId(destId) {
    return await prisma.rating.findMany({
      where: {
        dest_id: destId,
      },
    });
  }

  async deleteAll() {
    return await prisma.rating.deleteMany({});
  }
}

export default new RatingModel();
