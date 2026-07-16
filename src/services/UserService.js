import userModel from '../models/UserModel.js';
import { generateToken, hashPassword } from '../utils/JwtToken.js';
import { generateId } from '../utils/IdGenerator.js';

class UserService {
  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new Error('Please fill all the fields');
    }

    const UserEmail = await userModel.findByEmail(email);
    if (UserEmail.length > 0) {
      throw new Error('Email Already Use');
    }

    const id = generateId();
    const hashedPassword = hashPassword(password);

    await userModel.create({
      user_id: id,
      name,
      email,
      password: hashedPassword,
    });

    return {
      id,
      name,
      email,
      password: hashedPassword,
    };
  }

  async login({ email, password }) {
    if (!email) {
      throw new Error('Email is not allowed to be Empty');
    }
    if (!password) {
      throw new Error('Password is not allowed to be Empty');
    }

    const userData = await userModel.findByEmail(email);
    if (userData.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = userData[0];
    const hashedPassword = hashPassword(password);

    const userPassword = user.password.replace(/^\\x/, '');
    if (hashedPassword !== userPassword) {
      throw new Error('Invalid email or password');
    }

    const accessToken = generateToken(user.user_id);
    return { accessToken };
  }

  async getProfile(userId) {
    const userData = await userModel.findById(userId);
    if (userData.length === 0) {
      throw new Error('User not found');
    }

    const user = userData[0];
    return {
      id: user.user_id,
      name: user.name,
      email: user.email,
    };
  }
}

export default new UserService();
