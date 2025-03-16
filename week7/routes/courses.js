const express = require("express");

const router = express.Router();
const config = require("../config/index");
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Course");
const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});
const coursesController = require("../controller/courses");

router.get("/", coursesController.findCourse);

router.post("/:courseId", auth, coursesController.bookingCourse);

router.delete("/:courseId", auth, coursesController.cancelCourseBooking);

module.exports = router;
