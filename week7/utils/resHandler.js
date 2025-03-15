const errHandler = (res, code, status, message) => {
  res.status(code).json({
    status: status,
    message: message,
  });
};
const successHandler = (res, code, status, data) => {
  res.status(code).json({
    status: status,
    data: data,
  });
};

module.exports = { errHandler, successHandler };
