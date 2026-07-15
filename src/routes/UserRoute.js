import userController from '../controllers/UserController.js';
import authMiddleware from '../middleware/AuthMiddleware.js';

const UserRoute = [
  {
    method: 'POST',
    path: '/register',
    handler: userController.register,
  },
  {
    method: 'POST',
    path: '/login',
    handler: userController.login,
  },
  {
    method: 'GET',
    path: '/users/me',
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
    handler: userController.getProfile,
  },
];

export default UserRoute;
