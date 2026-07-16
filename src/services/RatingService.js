import { customAlphabet } from 'nanoid';
import ratingModel from '../models/RatingModel.js';
import destinationModel from '../models/DestinationModel.js';
import responseHelper from '../utils/ResponseHelper.js';

class RatingService {
  constructor() {
    this.generateId = customAlphabet(
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      10,
    );
  }

  async addRating(userId, destId, rating) {
    if (!destId) {
      throw new Error('Destinations ID is required');
    }
    if (rating === undefined || rating === null) {
      throw new Error('Rating is required');
    }
    if (typeof rating !== 'number') {
      throw new Error('Rating must be a number');
    }
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 until 5');
    }

    const destination = await destinationModel.findUnique(destId);
    if (!destination) {
      const error = new Error('Destinations not found');
      error.statusCode = 404;
      throw error;
    }

    const existingRating = await ratingModel.findMany(userId, destId);

    let ratingObj;
    if (existingRating.length > 0) {
      ratingObj = await ratingModel.update(existingRating[0].rating_id, {
        rating,
      });
    } else {
      const id = this.generateId();
      ratingObj = await ratingModel.create({
        rating_id: id,
        user_id: userId,
        dest_id: destId,
        rating,
      });
    }

    return {
      id: ratingObj.rating_id,
      rating: ratingObj.rating,
      dest_id: ratingObj.dest_id,
      dest_name: ratingObj.destination.name_dest,
      user_id: ratingObj.user_id,
      name: ratingObj.users.name,
    };
  }

  calculate = async (dest) => {
    try {
      const ratings = await ratingModel.findManyByDestId(dest.dest_id);
      const totalRating = ratings.length;
      const sumRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const avgRating = totalRating ? sumRating / totalRating : 0;
      const roundedRating = parseFloat(avgRating.toFixed(1));
      return responseHelper.AvgRatingResponse(dest, roundedRating);
    } catch (error) {
      console.error(error.message);
      return responseHelper.AvgRatingResponse(dest, 0);
    }
  };
}

export default new RatingService();
