import RegisterUser from '../handler/Authuser/handlerRegister.js';
import LoginUser from '../handler/Authuser/handlerLogin.js';
import GetUserLogin from '../handler/Authuser/handlerGetUserLogin.js';
import AddDestination from '../handler/Destinations/handlerAddDest.js';
import GetDestById from '../handler/Destinations/handlerGetDestById.js';
import DeleteDestById from '../handler/Destinations/handlerDeleteDest.js';
import GetAllDest from '../handler/Destinations/handlerGetAllDest.js';

const Routes = [
  {
    method: 'POST',
    path: '/register',
    handler: RegisterUser,
  },
  {
    method: 'POST',
    path: '/login',
    handler: LoginUser,
  },
  {
    method: 'GET',
    path: '/users/me',
    handler: GetUserLogin,
  },
  {
    method: 'POST',
    path: '/destinations',
    handler: AddDestination,
  },
  {
    method: 'GET',
    path: '/destinations/{id}',
    handler: GetDestById,
  },
  {
    method: 'DELETE',
    path: '/destinations/{id}',
    handler: DeleteDestById,
  },
  {
    method: 'GET',
    path: '/destinations',
    handler: GetAllDest,
  },
];

export default Routes;
