import prisma from '../config/DatabaseConfig.js';

class DestinationModel {
  async findByName(name) {
    return await prisma.destination.findMany({
      where: {
        name_dest: name,
      },
    });
  }

  async findUnique(id) {
    return await prisma.destination.findUnique({
      where: {
        dest_id: id,
      },
    });
  }

  async findMany(id) {
    return await prisma.destination.findMany({
      where: {
        dest_id: id,
      },
    });
  }

  async create(data) {
    return await prisma.destination.create({
      data,
    });
  }

  async deleteMany(id) {
    return await prisma.destination.deleteMany({
      where: {
        dest_id: id,
      },
    });
  }

  async findAll() {
    return await prisma.destination.findMany();
  }

  async deleteAll() {
    return await prisma.destination.deleteMany({});
  }
}

export default new DestinationModel();
