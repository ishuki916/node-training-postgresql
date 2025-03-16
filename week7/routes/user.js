const express = require("express");
const router = express.Router();
const config = require("../config/index");
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Users");
const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});
const userController = require("../controller/user");

router.post("/signup", userController.signUp);

router.post("/login", userController.login);

router.get("/profile", auth, userController.findProfile);

router.put("/profile", auth, userController.updateProfile);

module.exports = router;
