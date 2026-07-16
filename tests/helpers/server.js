import Hapi from '@hapi/hapi';
import Routes from '../../src/routes/routes.js';

export const buildServer = async () => {
  const server = Hapi.server({
    port: 0,
    host: 'localhost',
    routes: {
      cors: true,
    },
  });

  server.route(Routes);
  await server.initialize();
  return server;
};
