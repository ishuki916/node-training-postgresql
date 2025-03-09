const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Skill");

router.get("/", async (req, res, next) => {});

router.post("/", async (req, res, next) => {});

router.delete("/:skillId", async (req, res, next) => {});

module.exports = router;
