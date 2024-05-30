import jwt from 'jsonwebtoken';

const validateToken = (token) => {
  try {
    return jwt.verify(token, 'your_jwt_secret');
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const generateToken = (userId) => {
  const payload = {
    userId,
  };
  const secret = 'your_jwt_secret'; // Use a secure secret in production
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

export default { validateToken, generateToken };
