import prisma from '../../db/prisma.js';
import CountAvgRating from '../../middleware/Count-Avg-Rating.js';

const GetAllDest = async (req, res) => {
  try {
    const GetDestination = await prisma.destination.findMany();

    const DestinationRating = await Promise.all(
      GetDestination.map(CountAvgRating),
    );

    const responseData = res.response({
      status: 'success',
      message: 'Get All Destination success',
      data: {
        destinations: DestinationRating,
      },
    });
    responseData.code(200);
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

export default GetAllDest;
