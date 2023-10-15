import { PrismaClient } from '@prisma/client';

export default {
  name: 'prisma',
  execute(client) {
    try {
      client.prisma = new PrismaClient();
    } catch (err) {
      client.debug(`Database: Prisma | Connection: \x1b[1;32m${err.message}!`);
    }
  },
};
