import { validateToken } from '../../middleware/Jwt-Token.js';
import prisma from '../../db/prisma.js';

const DeleteDestById = async (req, res) => {
  const { id } = req.params;
  const { authorization } = req.headers;

  if (!authorization) {
    const responseData = res.response({
      status: 'fail',
      message: 'missing authentication token',
    });
    responseData.code(401);
    return responseData;
  }

  const token = authorization.split(' ')[1];
  const decoded = validateToken(token);

  if (!decoded) {
    const responseData = res.response({
      status: 'fail',
      message: 'invalid authentication token or token Expired',
    });
    responseData.code(401);
    return responseData;
  }

  try {
    const userData = await prisma.destination.findMany({
      where: {
        dest_id: id,
      },
    });
    if (userData.length > 0 && userData[0].dest_id === id) {
      // const QueryDelete = `DELETE FROM destination WHERE dest_id = ?`;
      // await query(QueryDelete, [id]);
      await prisma.destination.deleteMany({
        where: {
          dest_id: id,
        },
      });
      const responseData = res.response({
        status: 'success',
        message: 'Destination has been deleted',
        data: {
          dest_id: userData[0].dest_id,
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
    const response = res.response({
      status: 'fail',
      message: 'internal server error',
    });
    response.code(500);
    return response;
  }
};

export default DeleteDestById;
