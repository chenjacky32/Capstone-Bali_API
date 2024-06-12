/* eslint-disable prettier/prettier */
/* eslint-disable consistent-return */
import prisma from '../../db/prisma.js';
import { validateToken } from '../../middleware/Jwt-Token.js';

const UnBookmark = async (req, res) => {
  const { dest_id } = req.params;
  const { authorization } = req.headers;

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
      message: 'Destination ID is required',
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

    const existingBookmark = await prisma.bookmark_detail.findMany({
      where: {
        AND: [{ user_id: decoded.userId }, { dest_id }],
      },
      include: {
        users: true,
        destination: true,
      },
    });
    if (!existingBookmark) {
      const responseData = res.response({
        status: 'fail',
        message: 'Bookmark not found',
      });
      responseData.code(404);
      return responseData;
    }
    if (existingBookmark[0].isBookmark === true) {
      const updateBookmark = await prisma.bookmark_detail.update({
        where: {
          id: existingBookmark[0].id,
        },
        data: {
          isBookmark: false,
        },
        include: {
          users: true,
          destination: true,
        },
      });
      const responseData = res.response({
        status: 'success',
        message: 'Destinations unbookmarked',
        data: {
          id: updateBookmark.dest_id,
          user_id: updateBookmark.user_id,
          name: updateBookmark.users.name,
          dest_id: updateBookmark.dest_id,
          dest_name: updateBookmark.destination.name_dest,
          isBookmark: updateBookmark.isBookmark,
        },
      });
      responseData.code(200);
      return responseData;
    }
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
export default UnBookmark;
