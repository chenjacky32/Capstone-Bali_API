import prisma from '../../db/prisma.js';
import CountAvgRating from '../../middleware/Count-Avg-Rating.js';

const GetDestById = async (req, res) => {
  const { id } = req.params;

  try {
    const userData = await prisma.destination.findUnique({
      where: {
        dest_id: id,
      },
    });
    if (userData) {
      const destinationWithRating = await CountAvgRating(userData);
      const responseData = res.response({
        status: 'success',
        message: 'Get Destinations by id success',
        data: destinationWithRating,
      });
      responseData.code(200);
      return responseData;
    }

    const responseData = res.response({
      status: 'fail',
      message: 'Destination not found',
    });
    responseData.code(404);
    return responseData;
  } catch (error) {
    console.error(error.message);
    const responseData = res.response({
      status: 'fail',
      message: 'internal server error',
    });
    responseData.code(500);
    return responseData;
  }
};

export default GetDestById;
