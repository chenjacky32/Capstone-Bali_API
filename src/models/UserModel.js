import prisma from '../config/DatabaseConfig.js';

class UserModel {
  async findByEmail(email) {
    return await prisma.users.findMany({
      where: { email },
    });
  }

  async findById(userId) {
    return await prisma.users.findMany({
      where: { user_id: userId },
    });
  }

  async create(data) {
    return await prisma.users.create({
      data,
    });
  }

  async deleteAll() {
    return await prisma.users.deleteMany({});
  }
}

export default new UserModel();
