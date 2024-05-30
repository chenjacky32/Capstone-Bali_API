import crypto from 'crypto';
import { connection, query } from '../../services/connDB.js';

const RegisterUser = async (req, res) => {
  const { customAlphabet } = await import('nanoid');
  const { name, email, password } = req.payload;
  const generateId = customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    10,
  );
  const user_id = generateId();

  try {
    const QueryUserEmail = `SELECT * FROM users WHERE email = ?`;
    const UserEmail = await query(QueryUserEmail, [email]);

    if (UserEmail.length > 0) {
      const responseData = res.response({
        status: 'fail',
        message: 'Email Already Use',
      });
      responseData.code(400);
      return responseData;
    }

    if (!name || !email || !password) {
      const responseData = res.response({
        status: 'fail',
        message: 'Please fill all the fields',
      });
      responseData.code(400);
      return responseData;
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    const queryData = `INSERT INTO users (user_id,name,email,password) VALUES (?,?,?,?)`;
    await query(queryData, [user_id, name, email, password]);

    const responseData = res.response({
      status: 'success',
      message: 'User Created',
      data: {
        user_id,
        name,
        email,
        password: hashedPassword,
      },
    });
    responseData.code(201);
    return responseData;
  } catch (error) {
    console.log(error.message);
    const responseData = res.response({
      status: 'fail',
      message: 'Fail Created User',
    });
    responseData.code(500);
    return responseData;
  }
};

export default RegisterUser;
