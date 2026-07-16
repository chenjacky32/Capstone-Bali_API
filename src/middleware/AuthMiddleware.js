import { validateToken } from '../utils/JwtToken.js';
import responseHelper from '../utils/ResponseHelper.js';

class AuthMiddleware {
  verifyToken = async (req, res) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return responseHelper
        .error(res, 401, 'missing authentication token')
        .takeover();
    }

    const token = authorization.split(' ')[1];
    const decoded = validateToken(token);

    if (!decoded) {
      return responseHelper
        .error(res, 401, 'invalid authentication token or token Expired')
        .takeover();
    }

    return decoded;
  };
}

export default new AuthMiddleware();
