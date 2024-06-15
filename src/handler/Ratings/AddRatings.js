import prisma from '../../db/prisma.js';
import { validateToken } from '../../middleware/Jwt-Token.js';

const AddRatings = async (req, res) => {
  const { dest_id } = req.params;
  const { rating } = req.payload;
  const { authorization } = req.headers;
  const { customAlphabet } = await import('nanoid');
  const generateId = customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    10,
  );
  const id = generateId();
  if (!authorization) {
    const responseData = res.response({
      status: 'fail',
      message: 'missing authentication token',
    });
    responseData.code(401);
    return responseData;
  }
  if (!dest_id) {
    const responseData = res.response({
      status: 'fail',
      message: 'Destinations ID is required',
    });
    responseData.code(400);
    return responseData;
  }
  if (!rating) {
    const responseData = res.response({
      status: 'fail',
      message: 'Rating is required',
    });
    responseData.code(400);
    return responseData;
  }

  if (typeof rating !== 'number') {
    const responseData = res.response({
      status: 'fail',
      message: 'Rating must be a number',
    });
    responseData.code(400);
    return responseData;
  }

  if (rating < 1 || rating > 5) {
    const responseData = res.response({
      status: 'fail',
      message: 'Rating must be between 1 until 5',
    });
    responseData.code(400);
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
    const destination = await prisma.destination.findUnique({
      where: {
        dest_id,
      },
    });
    if (!destination) {
      const responseData = res.response({
        status: 'fail',
        message: 'Destinations not found',
      });
      responseData.code(404);
      return responseData;
    }

    const existingRating = await prisma.rating.findMany({
      where: {
        AND: [{ user_id: decoded.userId }, { dest_id }],
      },
      include: {
        users: true,
        destination: true,
      },
    });

    if (existingRating.length > 0) {
      const updatedRating = await prisma.rating.update({
        where: {
          rating_id: existingRating[0].rating_id,
        },
        data: {
          rating,
        },
        include: {
          users: true,
          destination: true,
        },
      });
      const responseData = res.response({
        status: 'success',
        message: 'Rating created successfully',
        data: {
          id: updatedRating.rating_id,
          rating: updatedRating.rating,
          dest_id: updatedRating.dest_id,
          dest_name: updatedRating.destination.name_dest,
          user_id: updatedRating.user_id,
          name: updatedRating.users.name,
        },
      });
      responseData.code(200);
      return responseData;
    }
    const newRating = await prisma.rating.create({
      data: {
        rating_id: id,
        user_id: decoded.userId,
        dest_id,
        rating,
      },
      include: {
        users: true,
        destination: true,
      },
    });
    const responseData = res.response({
      status: 'success',
      message: 'Rating created successfully',
      data: {
        id: newRating.rating_id,
        rating: newRating.rating,
        dest_id: newRating.dest_id,
        dest_name: newRating.destination.name_dest,
        user_id: newRating.user_id,
        name: newRating.users.name,
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

export default AddRatings;
