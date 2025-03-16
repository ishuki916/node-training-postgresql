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

const creditPackageController = require("../controller/creditPackage");
router.get("/", creditPackageController.findCreditPackage);

router.post("/", creditPackageController.createCreditPackage);

router.post("/:creditPackageId", auth, creditPackageController.purchasePackage);

router.delete("/:creditPackageId", creditPackageController.deletePackage);

module.exports = router;
