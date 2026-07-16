import ratingService from '../../src/services/RatingService.js';
import bookmarkService from '../../src/services/BookmarkService.js';
import userService from '../../src/services/UserService.js';
import destinationService from '../../src/services/DestinationService.js';

export const cleanDb = async () => {
  // Delete in order to avoid foreign key constraint violations
  await ratingService.cleanRatings();
  await bookmarkService.cleanBookmarks();
  await userService.cleanUsers();
  await destinationService.cleanDestinations();
};
