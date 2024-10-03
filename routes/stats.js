const express = require('express');
const statsController = require('../controllers/statsController');
const router = express.Router();

router.get('/', statsController.status);
// router.get("status",);

module.exports = router;
