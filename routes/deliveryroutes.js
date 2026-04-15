const express = require("express");
const router = express.Router();
const { createDelivery } = require("../controllers/deliverycontroller");
const auth = require("../middleware/auth");

router.post("/", auth, createDelivery);

module.exports = router;