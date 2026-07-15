import bookmarkService from '../services/BookmarkService.js';
import responseHelper from '../utils/ResponseHelper.js';

class BookmarkController {
  addBookmark = async (req, res) => {
    const { dest_id } = req.params;
    const decoded = req.pre.auth;

    try {
      const data = await bookmarkService.addBookmark(decoded.userId, dest_id);
      return responseHelper.success(res, 200, 'Destinations Bookmarked', data);
    } catch (error) {
      const statusCode = error.statusCode || 400;
      return responseHelper.error(res, statusCode, error.message);
    }
  };

  unBookmark = async (req, res) => {
    const { dest_id } = req.params;
    const decoded = req.pre.auth;

    try {
      const data = await bookmarkService.unBookmark(decoded.userId, dest_id);
      return responseHelper.success(
        res,
        200,
        'Destinations unbookmarked',
        data,
      );
    } catch (error) {
      const statusCode = error.statusCode || 400;
      return responseHelper.error(res, statusCode, error.message);
    }
  };

  getBookmarks = async (req, res) => {
    const decoded = req.pre.auth;

    try {
      const data = await bookmarkService.getBookmarks(decoded.userId);
      return responseHelper.success(res, 200, 'Destinations retrieved', {
        Bookmarks: data,
      });
    } catch (error) {
      return responseHelper.error(res, 500, 'internal server error');
    }
  };

  getUnbookmarked = async (req, res) => {
    const decoded = req.pre.auth;

    try {
      const data = await bookmarkService.getUnbookmarked(decoded.userId);
      return responseHelper.success(res, 200, 'Destinations retrieved', {
        Unbookmarked: data,
      });
    } catch (error) {
      return responseHelper.error(res, 500, 'internal server error');
    }
  };
}

export default new BookmarkController();
