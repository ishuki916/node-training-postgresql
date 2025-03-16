const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Skill");

const skillController = require("../controller/skill");

router.get("/", skillController.findSkill);

router.post("/", skillController.createSkill);

router.delete("/:skillId", skillController.deleteSkill);

module.exports = router;
