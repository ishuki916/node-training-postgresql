const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("CreditPackage");
const { errHandler, successHandler } = require("../utils/resHandler");
const {
  isUndefined,
  isNotValidSting,
  isNotValidInteger,
} = require("../utils/validator");

router.get("/", async (req, res, next) => {
  try {
    const packages = await dataSource.getRepository("CreditPackage").find({
      select: ["id", "name", "credit_amount", "price"],
    });
    successHandler(res, 200, "success", packages);
  } catch (error) {
    console.log(error);
    errHandler(res, 500, "error", "伺服器錯誤");
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    if (
      isUndefined(data.name) ||
      isNotValidSting(data.name) ||
      isUndefined(data.credit_amount) ||
      isNotValidInteger(data.credit_amount) ||
      isUndefined(data.price) ||
      isNotValidInteger(data.price)
    ) {
      errHandler(res, 400, "failed", "欄位未填寫正確");
      return;
    }
    const creditPackageRepo = await dataSource.getRepository("CreditPackage");
    const existPackage = await creditPackageRepo.find({
      where: {
        name: data.name,
      },
    });
    if (existPackage.length > 0) {
      errHandler(res, 409, "failed", "資料重複");
      return;
    }
    const newPackage = await creditPackageRepo.create({
      name: data.name,
      credit_amount: data.credit_amount,
      price: data.price,
    });
    const result = await creditPackageRepo.save(newPackage);
    successHandler(res, 201, "success", result);
  } catch (error) {
    console.error(error);
    errHandler(res, 500, "error", "伺服器錯誤");
  }
});

router.delete("/:creditPackageId", async (req, res, next) => {
  try {
    const data = req.params;
    const packageId = data.creditPackageId;

    if (isUndefined(packageId) || isNotValidSting(packageId)) {
      errhandle(res, 400, "failed", "ID錯誤");
      return;
    }
    const result = await dataSource
      .getRepository("CreditPackage")
      .delete(packageId);
    if (result.affected === 0) {
      errHandler(res, 400, "failed", "ID錯誤");
      return;
    }
    successHandler(res, 200, "success", null);
  } catch (error) {
    console.error(error);
    errHandler(res, 500, "error", "伺服器錯誤");
  }
});

module.exports = router;
