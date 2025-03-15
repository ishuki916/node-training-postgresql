const express = require("express");

const router = express.Router();
const config = require("../config/index");
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("CreditPackage");
const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});
const {
  isUndefined,
  isNotValidSting,
  isNotValidInteger,
} = require("../utils/validator");
const { errHandler, successHandler } = require("../utils/resHandler");

router.get("/", async (req, res, next) => {
  try {
    const creditPackage = await dataSource.getRepository("CreditPackage").find({
      select: ["id", "name", "credit_amount", "price"],
    });
    successHandler(res, 200, "success", creditPackage);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, credit_amount: creditAmount, price } = req.body;
    if (
      isUndefined(name) ||
      isNotValidSting(name) ||
      isUndefined(creditAmount) ||
      isNotValidInteger(creditAmount) ||
      isUndefined(price) ||
      isNotValidInteger(price)
    ) {
      errHandler(res, 400, "failed", "欄位未填寫正確");
      return;
    }
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const existCreditPackage = await creditPackageRepo.find({
      where: {
        name,
      },
    });
    if (existCreditPackage.length > 0) {
      errHandler(res, 409, "failed", "資料重複");
      return;
    }
    const newCreditPurchase = await creditPackageRepo.create({
      name,
      credit_amount: creditAmount,
      price,
    });
    const result = await creditPackageRepo.save(newCreditPurchase);
    successHandler(res, 200, "success", result);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.post("/:creditPackageId", auth, async (req, res, next) => {
  try {
    const { id } = req.user;
    const { creditPackageId } = req.params;
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const creditPackage = await creditPackageRepo.findOne({
      where: {
        id: creditPackageId,
      },
    });
    if (!creditPackage) {
      errHandler(res, 400, "failed", "ID錯誤");
      return;
    }
    const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
    const newPurchase = await creditPurchaseRepo.create({
      user_id: id,
      credit_package_id: creditPackageId,
      purchased_credits: creditPackage.credit_amount,
      price_paid: creditPackage.price,
      purchaseAt: new Date().toISOString(),
    });
    await creditPurchaseRepo.save(newPurchase);
    successHandler(res, 200, "success", null);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.delete("/:creditPackageId", async (req, res, next) => {
  try {
    const { creditPackageId } = req.params;
    if (isUndefined(creditPackageId) || isNotValidSting(creditPackageId)) {
      errHandler(res, 400, "failed", "欄位未填寫正確");
      return;
    }
    const result = await dataSource
      .getRepository("CreditPackage")
      .delete(creditPackageId);
    if (result.affected === 0) {
      errHandler(res, 400, "failed", "ID錯誤");
      return;
    }
    successHandler(res, 200, "success", result);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;
