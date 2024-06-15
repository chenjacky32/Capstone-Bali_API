import Hapi from '@hapi/hapi';
import Routes from './src/routes/routes.js';
import prisma from './src/db/prisma.js';

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
      cors: true,
    },
  });

  server.route(Routes);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
  console.log(server);

  // Connect to Database
  try {
    await prisma.$connect();
    console.log('Koneksi ke Database Berhasil');
  } catch (error) {
    console.error('Koneksi Ke Database Gagal :', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

init();
