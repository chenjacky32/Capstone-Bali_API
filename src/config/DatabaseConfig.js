import { PrismaClient } from '@prisma/client';

class DatabaseConfig {
  constructor() {
    if (!DatabaseConfig.instance) {
      if (process.env.NODE_ENV === 'production') {
        this.prisma = new PrismaClient();
      } else {
        if (!global.prisma) {
          global.prisma = new PrismaClient();
        }
        this.prisma = global.prisma;
      }
      DatabaseConfig.instance = this;
    }
    return DatabaseConfig.instance;
  }

  getClient() {
    return this.prisma;
  }
}

const databaseConfig = new DatabaseConfig();
export default databaseConfig.getClient();
