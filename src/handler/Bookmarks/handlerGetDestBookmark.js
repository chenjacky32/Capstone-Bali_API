import prisma from '../../db/prisma.js';
import { validateToken } from '../../middleware/Jwt-Token.js';

const GetDestBookmark = async (req, res) => {
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
    const bookmarks = await prisma.bookmark_detail.findMany({
      where: {
        user_id: decoded.userId,
        isBookmark: true,
      },
      include: {
        users: true,
        destination: true,
      },
    });

    // console.log(bookmarks);

    const bookmarkData = bookmarks.map((bookmark) => ({
      id: bookmark.id,
      user_id: bookmark.user_id,
      name: bookmark.users.name,
      dest_id: bookmark.dest_id,
      dest_name: bookmark.destination.name_dest,
      isBookmark: bookmark.isBookmark,
    }));

    console.log(bookmarkData);

    const responseData = res.response({
      status: 'success',
      message: 'Destinations retrieved',
      data: {
        Bookmarks: bookmarkData,
      },
    });
    responseData.code(200);
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

export default GetDestBookmark;
