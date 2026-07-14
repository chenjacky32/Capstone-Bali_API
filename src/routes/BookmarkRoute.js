import bookmarkController from '../controllers/BookmarkController.js';
import authMiddleware from '../middleware/AuthMiddleware.js';

const BookmarkRoute = [
  {
    method: 'POST',
    path: '/destinations/{dest_id}/bookmarks',
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
    handler: bookmarkController.addBookmark,
  },
  {
    method: 'POST',
    path: '/destinations/{dest_id}/unbookmarked',
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
    handler: bookmarkController.unBookmark,
  },
  {
    method: 'GET',
    path: '/destinations/bookmarks',
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
    handler: bookmarkController.getBookmarks,
  },
  {
    method: 'GET',
    path: '/destinations/unbookmarked',
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
    handler: bookmarkController.getUnbookmarked,
  },
];

export default BookmarkRoute;
