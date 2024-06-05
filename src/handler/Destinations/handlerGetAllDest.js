import prisma from '../../db/prisma.js';
import { validateToken } from '../../middleware/Jwt-Token.js';

const GetAllDest = async (req, res) => {
  try {
    const GetDestination = await prisma.destination.findMany();
    const Destination = GetDestination.map((dest) => ({
      id: dest.dest_id,
      name: dest.name_dest,
      description: dest.description,
      img: dest.img,
      location: dest.location,
    }));
    const responseData = res.response({
      status: 'Success',
      message: 'Get All Destination success',
      data: {
        Destination,
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
