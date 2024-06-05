import prisma from '../../db/prisma.js';
import { validateToken } from '../../middleware/Jwt-Token.js';

const AddDestination = async (req, res) => {
  const { customAlphabet } = await import('nanoid');
  const { name, description, img, location } = req.payload;
  const generateId = customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    10,
  );
  const id = generateId();
  const { authorization } = req.headers;

  if (!authorization) {
    const responseData = res.response({
      status: 'fail',
      message: 'missing authentication token',
    });
    responseData.code(401);
    return responseData;
  }
  if (!name || !description || !img || !location) {
    const response = res.response({
      status: 'fail',
      message: 'Please fill all the fields',
    });
    response.code(400);
    return response;
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
    const Data_Dest = await prisma.destination.findMany({
      where: {
        name_dest: name,
      },
    });
    if (Data_Dest.length > 0) {
      const response = res.response({
        status: 'fail',
        message: 'Destination Already Exist',
      });
      response.code(400);
      return response;
    }

    await prisma.destination.create({
      data: {
        dest_id: id,
        name_dest: name,
        description,
        img,
        location,
      },
    });

    const response = res.response({
      status: 'success',
      message: 'Destination Created successfully',
      data: {
        id,
        name,
        description,
        img,
        location,
      },
    });
    response.code(201);
    return response;
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

export default AddDestination;
