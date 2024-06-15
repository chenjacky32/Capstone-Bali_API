import RegisterUser from '../handler/Authuser/handlerRegister.js';
import LoginUser from '../handler/Authuser/handlerLogin.js';
import GetUserLogin from '../handler/Authuser/handlerGetUserLogin.js';
import AddDestination from '../handler/Destinations/handlerAddDest.js';
import GetDestById from '../handler/Destinations/handlerGetDestById.js';
import DeleteDestById from '../handler/Destinations/handlerDeleteDest.js';
import GetAllDest from '../handler/Destinations/handlerGetAllDest.js';
import AddBookmark from '../handler/Bookmarks/handlerAddBookmark.js';
import GetDestBookmark from '../handler/Bookmarks/handlerGetDestBookmark.js';
import GetDestUnBookmarked from '../handler/Bookmarks/handlerGetDestUnBookmark.js';
import UnBookmark from '../handler/Bookmarks/handlerUnBookmark.js';
import AddRatings from '../handler/Ratings/AddRatings.js';

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
  {
    method: 'POST',
    path: '/destinations/{dest_id}/bookmarks',
    handler: AddBookmark,
  },
  {
    method: 'POST',
    path: '/destinations/{dest_id}/unbookmarked',
    handler: UnBookmark,
  },
  {
    method: 'GET',
    path: '/destinations/bookmarks',
    handler: GetDestBookmark,
  },
  {
    method: 'GET',
    path: '/destinations/unbookmarked',
    handler: GetDestUnBookmarked,
  },
  {
    method: 'POST',
    path: '/destinations/{dest_id}/ratings',
    handler: AddRatings,
  },
];

export default Routes;
