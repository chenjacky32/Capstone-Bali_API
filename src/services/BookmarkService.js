import bookmarkModel from '../models/BookmarkModel.js';
import destinationModel from '../models/DestinationModel.js';
import { generateId } from '../utils/IdGenerator.js';

class BookmarkService {
  async addBookmark(userId, destId) {
    if (!destId) {
      throw new Error('Destinations ID is required');
    }

    const destination = await destinationModel.findUnique(destId);
    if (!destination) {
      const error = new Error('Destinations not found');
      error.statusCode = 404;
      throw error;
    }

    const existingBookmark = await bookmarkModel.findMany(userId, destId);

    let bookmark;
    if (existingBookmark.length > 0) {
      bookmark = await bookmarkModel.update(existingBookmark[0].id, {
        isBookmark: true,
      });
    } else {
      const id = generateId();
      bookmark = await bookmarkModel.create({
        id,
        isBookmark: true,
        user_id: userId,
        dest_id: destId,
      });
    }

    return {
      id: bookmark.id,
      user_id: bookmark.user_id,
      name: bookmark.users.name,
      dest_id: bookmark.dest_id,
      dest_name: bookmark.destination.name_dest,
      isBookmark: bookmark.isBookmark,
    };
  }

  async unBookmark(userId, destId) {
    if (!destId) {
      throw new Error('Destination ID is required');
    }

    const destination = await destinationModel.findUnique(destId);
    if (!destination) {
      const error = new Error('Destinations not found');
      error.statusCode = 404;
      throw error;
    }

    const existingBookmark = await bookmarkModel.findMany(userId, destId);
    if (existingBookmark.length === 0) {
      const error = new Error('Bookmark not found');
      error.statusCode = 404;
      throw error;
    }

    const bookmark = await bookmarkModel.update(existingBookmark[0].id, {
      isBookmark: false,
    });

    return {
      id: bookmark.dest_id,
      user_id: bookmark.user_id,
      name: bookmark.users.name,
      dest_id: bookmark.dest_id,
      dest_name: bookmark.destination.name_dest,
      isBookmark: bookmark.isBookmark,
    };
  }

  async getBookmarks(userId) {
    const bookmarks = await bookmarkModel.findManyByUserId(userId, true);
    return bookmarks.map((bookmark) => ({
      id: bookmark.id,
      user_id: bookmark.user_id,
      name: bookmark.users.name,
      dest_id: bookmark.dest_id,
      dest_name: bookmark.destination.name_dest,
      isBookmark: bookmark.isBookmark,
    }));
  }

  async getUnbookmarked(userId) {
    const bookmarks = await bookmarkModel.findManyByUserId(userId, false);
    return bookmarks.map((bookmark) => ({
      id: bookmark.id,
      user_id: bookmark.user_id,
      name: bookmark.users.name,
      dest_id: bookmark.dest_id,
      dest_name: bookmark.destination.name_dest,
      isBookmark: bookmark.isBookmark,
    }));
  }

  async getBookmark(userId, destId) {
    const existingBookmark = await bookmarkModel.findMany(userId, destId);
    return existingBookmark.length > 0 ? existingBookmark[0] : null;
  }

  async cleanBookmarks() {
    await bookmarkModel.deleteAll();
  }
}

export default new BookmarkService();
