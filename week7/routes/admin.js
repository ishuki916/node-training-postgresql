const express = require("express");
const router = express.Router();
const config = require("../config/index");
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Admin");
const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});
const isCoach = require("../middlewares/isCoach");
const adminController = require("../controller/admin");

router.post("/coaches/courses", auth, isCoach, adminController.createCourses);

router.put(
  "/coaches/courses/:courseId",
  auth,
  isCoach,
  adminController.updateCourse
);

router.post("/coaches/:userId", adminController.createCoach);

module.exports = router;
