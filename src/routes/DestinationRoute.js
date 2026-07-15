import destinationController from '../controllers/DestinationController.js';
import authMiddleware from '../middleware/AuthMiddleware.js';

const DestinationRoute = [
  {
    method: 'POST',
    path: '/destinations',
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
    handler: destinationController.addDestination,
  },
  {
    method: 'GET',
    path: '/destinations/{id}',
    handler: destinationController.getDestinationById,
  },
  {
    method: 'DELETE',
    path: '/destinations/{id}',
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
    handler: destinationController.deleteDestinationById,
  },
  {
    method: 'GET',
    path: '/destinations',
    handler: destinationController.getAllDestinations,
  },
];

export default DestinationRoute;
