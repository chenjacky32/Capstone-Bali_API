import prisma from '../../db/prisma.js';
import { validateToken } from '../../middleware/Jwt-Token.js';

const GetDestById = async (req, res) => {
  const { id } = req.params;

  try {
    const userData = await prisma.destination.findMany({
      where: {
        dest_id: id,
      },
    });
    if (userData.length > 0) {
      const responseData = res.response({
        status: 'success',
        message: 'Get Destinations by id success',
        data: {
          id: userData[0].dest_id,
          name: userData[0].name_dest,
          description: userData[0].description,
          img: userData[0].img,
          location: userData[0].location,
        },
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
