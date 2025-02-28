const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Length, X-Requested-With",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
  "Content-Type": "application/json",
};
const errhandle = (res, code, status, message) => {
  res.writeHead(code, headers);
  res.write(
    JSON.stringify({
      status: status,
      message: message,
    })
  );
  res.end();
};

module.exports = errhandle;
