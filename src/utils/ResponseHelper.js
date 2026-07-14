class ResponseHelper {
  success(res, statusCode, message, data = null) {
    const payload = {
      status: 'success',
      message,
    };
    if (data !== null) {
      payload.data = data;
    }
    const response = res.response(payload);
    response.code(statusCode);
    return response;
  }

  error(res, statusCode, message, errors = null) {
    const payload = {
      status: 'fail',
      message,
    };
    if (errors !== null) {
      payload.errors = errors;
    }
    const response = res.response(payload);
    response.code(statusCode);
    return response;
  }
}

export default new ResponseHelper();
