import prisma from '../../db/prisma.js';
import { validateToken } from '../../middleware/Jwt-Token.js';

const AddBookmark = async (req, res) => {
  // const { isBookmark } = req.payload;
  const { customAlphabet } = await import('nanoid');
  const { dest_id } = req.params;
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

  if (!dest_id) {
    const responseData = res.response({
      status: 'fail',
      message: 'Destinations ID is required',
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
    console.log(`existingBookmark ${existingBookmark}`);

    if (existingBookmark.length > 0) {
      const updatedBookmark = await prisma.bookmark_detail.update({
        where: {
          id: existingBookmark[0].id,
        },
        data: {
          isBookmark: true,
        },
        include: {
          users: true,
          destination: true,
        },
      });
      console.log(`updatedBookmark ${updatedBookmark}`);

      const responseData = res.response({
        status: 'success',
        message: 'Destinations Bookmarked',
        data: {
          id: updatedBookmark.id,
          user_id: updatedBookmark.user_id,
          name: updatedBookmark.users.name,
          dest_id: updatedBookmark.dest_id,
          dest_name: updatedBookmark.destination.name_dest,
          isBookmark: updatedBookmark.isBookmark,
        },
      });
      responseData.code(200);
      return responseData;
    }
    const newBookmark = await prisma.bookmark_detail.create({
      data: {
        id,
        isBookmark: true,
        user_id: decoded.userId,
        dest_id,
      },
      include: {
        users: true,
        destination: true,
      },
    });
    console.log(`newBookmark ${newBookmark}`);
    const responseData = res.response({
      status: 'success',
      message: 'Destinations Bookmarked',
      data: {
        id: newBookmark.id,
        isBookmark: newBookmark.isBookmark,
        user_id: newBookmark.user_id,
        name: newBookmark.users.name,
        dest_id: newBookmark.dest_id,
        name_dest: newBookmark.destination.name_dest,
      },
    });
    responseData.code(200);
    return responseData;
  } catch (error) {
    console.error(error.message);
    const responseData = res.response({
      status: 'fail',
      message: 'Internal Server Error',
    });
    responseData.code(500);
    return responseData;
  }
};

export default AddBookmark;
