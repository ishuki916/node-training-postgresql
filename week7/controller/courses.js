const { dataSource } = require("../db/data-source");
const { successHandler, errHandler } = require("../utils/resHandler");
const logger = require("../utils/logger")("Course");
const { IsNull } = require("typeorm");

const findCourse = async (req, res, next) => {
  try {
    const courses = await dataSource.getRepository("Course").find({
      select: {
        id: true,
        name: true,
        description: true,
        start_at: true,
        end_at: true,
        max_participants: true,
        User: {
          name: true,
        },
        Skill: {
          name: true,
        },
      },
      relations: {
        User: true,
        Skill: true,
      },
    });
    successHandler(
      res,
      200,
      "success",
      courses.map((course) => {
        return {
          id: course.id,
          name: course.name,
          description: course.description,
          start_at: course.start_at,
          end_at: course.end_at,
          max_participants: course.max_participants,
          coach_name: course.User.name,
          skill_name: course.Skill.name,
        };
      })
    );
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const bookingCourse = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { courseId } = req.params;
    const courseRepo = dataSource.getRepository("Course");
    const course = await courseRepo.findOne({
      where: {
        id: courseId,
      },
    });
    if (!course) {
      errHandler(res, 400, "failed", "ID錯誤");
      return;
    }
    const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
    const courseBookingRepo = dataSource.getRepository("CourseBooking");
    const userCourseBooking = await courseBookingRepo.findOne({
      where: {
        user_id: id,
        course_id: courseId,
      },
    });
    if (userCourseBooking) {
      errHandler(res, 400, "failed", "已經報名過此課程");
      return;
    }
    const userCredit = await creditPurchaseRepo.sum("purchased_credits", {
      user_id: id,
    });
    const userUsedCredit = await courseBookingRepo.count({
      where: {
        user_id: id,
        cancelledAt: IsNull(),
      },
    });
    const courseBookingCount = await courseBookingRepo.count({
      where: {
        course_id: courseId,
        cancelledAt: IsNull(),
      },
    });
    if (userUsedCredit >= userCredit) {
      errHandler(res, 400, "failed", "已無可使用堂數");
      return;
    } else if (courseBookingCount >= course.max_participants) {
      errHandler(res, 400, "failed", "已達最大參加人數，無法參加");
      return;
    }
    const newCourseBooking = await courseBookingRepo.create({
      user_id: id,
      course_id: courseId,
    });
    await courseBookingRepo.save(newCourseBooking);
    successHandler(res, 201, "success", null);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const cancelCourseBooking = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { courseId } = req.params;
    const courseBookingRepo = dataSource.getRepository("CourseBooking");
    const userCourseBooking = await courseBookingRepo.findOne({
      where: {
        user_id: id,
        course_id: courseId,
        cancelledAt: IsNull(),
      },
    });
    if (!userCourseBooking) {
      errHandler(res, 400, "failed", "ID錯誤");
      return;
    }
    const updateResult = await courseBookingRepo.update(
      {
        user_id: id,
        course_id: courseId,
        cancelledAt: IsNull(),
      },
      {
        cancelledAt: new Date().toISOString(),
      }
    );
    if (updateResult.affected === 0) {
      errHandler(res, 400, "failed", "取消失敗");
      return;
    }
    successHandler(res, 200, "success", null);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

module.exports = { findCourse, bookingCourse, cancelCourseBooking };
