const express = require("express");
const statsController = require("../controllers/stats");
const router = express.Router();

router.get("/", statsController.status);
// router.get("status",);

module.exports = router;
