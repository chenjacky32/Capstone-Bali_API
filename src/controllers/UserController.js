import userService from '../services/UserService.js';
import responseHelper from '../utils/ResponseHelper.js';

class UserController {
  register = async (req, res) => {
    try {
      const data = await userService.register(req.payload);
      return responseHelper.success(res, 201, 'User Created', data);
    } catch (error) {
      if (
        error.message === 'Email Already Use' ||
        error.message === 'Please fill all the fields'
      ) {
        return responseHelper.error(res, 400, error.message);
      }
      return responseHelper.error(res, 500, 'internal server error');
    }
  };

  login = async (req, res) => {
    try {
      const data = await userService.login(req.payload);
      return responseHelper.success(res, 200, 'User Logged successfully', data);
    } catch (error) {
      if (
        error.message === 'Email is not allowed to be Empty' ||
        error.message === 'Password is not allowed to be Empty'
      ) {
        return responseHelper.error(res, 400, error.message);
      }
      if (error.message === 'Invalid email or password') {
        return responseHelper.error(res, 401, error.message);
      }
      return responseHelper.error(res, 500, 'internal server error');
    }
  };

  getProfile = async (req, res) => {
    // Note: in our route verification we will assign decoded token to req.pre.auth
    const decoded = req.pre.auth;
    try {
      const data = await userService.getProfile(decoded.userId);
      return responseHelper.success(res, 200, 'User retrieved', data);
    } catch (error) {
      if (error.message === 'User not found') {
        return responseHelper.error(res, 404, error.message);
      }
      return responseHelper.error(res, 500, 'internal server error');
    }
  };
}

export default new UserController();
