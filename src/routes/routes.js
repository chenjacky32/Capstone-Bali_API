import UserRoute from './UserRoute.js';
import DestinationRoute from './DestinationRoute.js';
import BookmarkRoute from './BookmarkRoute.js';
import RatingRoute from './RatingRoute.js';

const Routes = [
  ...UserRoute,
  ...DestinationRoute,
  ...BookmarkRoute,
  ...RatingRoute,
];

export default Routes;
