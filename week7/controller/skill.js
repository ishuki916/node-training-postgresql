const { errHandler, successHandler } = require("../utils/resHandler");
const { isUndefined, isNotValidSting } = require("../utils/validator");
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Skill");

const findSkill = async (req, res, next) => {
  try {
    const skills = await dataSource.getRepository("Skill").find({
      select: ["id", "name"],
    });
    successHandler(res, 200, "success", skills);
  } catch (error) {
    errHandler(res, 500, "error", "伺服器錯誤");
  }
};

const createSkill = async (req, res, next) => {
  try {
    const data = req.body;
    if (isUndefined(data.name) || isNotValidSting(data.name)) {
      errHandler(res, 400, "failed", "欄位未填寫正確");
      return;
    }
    const skillRepo = await dataSource.getRepository("Skill");
    const existSkill = await skillRepo.find({
      where: {
        name: data.name,
      },
    });
    if (existSkill.length > 0) {
      errHandler(res, 409, "failed", "資料重複");
      return;
    }
    const newSkill = await skillRepo.create({
      name: data.name,
    });
    const result = await skillRepo.save(newSkill);
    successHandler(res, 201, "success", result);
  } catch (error) {
    errHandler(res, 500, "error", "伺服器錯誤");
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    const data = req.params;
    const skillId = data.skillId;

    if (isUndefined(skillId) || isNotValidSting(skillId)) {
      errhandle(res, 400, "failed", "ID錯誤");
      return;
    }
    const result = await dataSource.getRepository("Skill").delete(skillId);
    if (result.affected === 0) {
      errHandler(res, 400, "failed", "ID錯誤");
      return;
    }
    successHandler(res, 200, "success", null);
  } catch (error) {
    errHandler(res, 500, "error", "伺服器錯誤");
  }
};
module.exports = { findSkill, createSkill, deleteSkill };
