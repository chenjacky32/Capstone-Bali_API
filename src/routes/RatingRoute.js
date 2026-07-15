import ratingController from '../controllers/RatingController.js';
import authMiddleware from '../middleware/AuthMiddleware.js';

const RatingRoute = [
  {
    method: 'POST',
    path: '/destinations/{dest_id}/ratings',
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
    handler: ratingController.addRating,
  },
];

export default RatingRoute;
