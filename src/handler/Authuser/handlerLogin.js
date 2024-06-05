import crypto from 'crypto';
import { generateToken } from '../../middleware/Jwt-Token.js';
import prisma from '../../db/prisma.js';

const LoginUser = async (req, res) => {
  const { email, password } = req.payload;

  if (!email) {
    const response = res.response({
      status: 'fail',
      message: 'Email is not allowed to be Empty',
    });
    response.code(400);
    return response;
  }
  if (!password) {
    const response = res.response({
      status: 'fail',
      message: 'Password is not allowed to be Empty',
    });
    response.code(400);
    return response;
  }
  try {
    const userData = await prisma.users.findMany({
      where: {
        email,
      },
    });

    if (userData.length === 0) {
      console.log('user tidak ada');
      const response = res.response({
        status: 'fail',
        message: 'Invalid email or password',
      });
      response.code(401);
      return response;
    }

    const user = userData[0];
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    if (hashedPassword !== user.password) {
      const response = res.response({
        status: 'fail',
        message: 'Invalid email or password',
      });
      response.code(401);
      return response;
    }

    const AccessToken = generateToken(user.user_id);

    const response = res.response({
      status: 'success',
      message: 'User Logged successfully',
      data: {
        accessToken: AccessToken,
      },
    });
    response.code(200);
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

export default LoginUser;
