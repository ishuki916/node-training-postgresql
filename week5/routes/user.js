const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("User");
const { errHandler, successHandler } = require("../utils/resHandler");
const { isUndefined, isNotValidSting } = require("../utils/validator");

const saltRounds = 10;

router.post("/signup", async (req, res, next) => {
  try {
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;
    const { name, email, password } = req.body;
    // 驗證必填欄位
    if (
      isUndefined(name) ||
      isNotValidSting(name) ||
      isUndefined(email) ||
      isNotValidSting(email) ||
      isUndefined(password) ||
      isNotValidSting(password)
    ) {
      logger.warn("欄位未填寫正確");
      errHandler(res, 400, "failed", "欄位未填寫正確");
      return;
    }
    if (!passwordPattern.test(password)) {
      logger.warn(
        "建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
      );
      errHandler(
        res,
        400,
        "failed",
        "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
      );
      return;
    }
    const userRepository = dataSource.getRepository("User");
    // 檢查 email 是否已存在
    const existingUser = await userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      logger.warn("建立使用者錯誤: Email 已被使用");
      errHandler(res, 409, "failed", "Email 已被使用");
      return;
    }

    // 建立新使用者
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const newUser = userRepository.create({
      name,
      email,
      role: "USER",
      password: hashPassword,
    });

    const savedUser = await userRepository.save(newUser);
    logger.info("新建立的使用者ID:", savedUser.id);
    successHandler(res, 201, "success", {
      user: {
        id: savedUser.id,
        name: savedUser.name,
      },
    });
  } catch (error) {
    logger.error("建立使用者錯誤:", error);
    next(error);
  }
});

module.exports = router;
