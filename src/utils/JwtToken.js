import jwt from 'jsonwebtoken';

export const validateToken = (token) => {
  try {
    return jwt.verify(token, 'your_jwt_secret');
    // secret diambil dri env ketika production
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

export const generateToken = (userId) => {
  const payload = {
    userId,
  };
  const secret = 'your_jwt_secret'; // Use a secure secret in production
  // secret diambil dri env ketika production
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};
