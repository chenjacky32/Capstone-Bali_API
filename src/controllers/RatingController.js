import ratingService from '../services/RatingService.js';
import responseHelper from '../utils/ResponseHelper.js';

class RatingController {
  addRating = async (req, res) => {
    const { dest_id } = req.params;
    const { rating } = req.payload;
    const decoded = req.pre.auth;

    try {
      const data = await ratingService.addRating(
        decoded.userId,
        dest_id,
        rating,
      );
      return responseHelper.success(
        res,
        200,
        'Rating created successfully',
        data,
      );
    } catch (error) {
      const statusCode = error.statusCode || 400;
      return responseHelper.error(res, statusCode, error.message);
    }
  };
}

export default new RatingController();
