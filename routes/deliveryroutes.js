module.exports = (io) => {
  const express = require("express");
  const router = express.Router();
  const { createDelivery } = require("../controllers/deliverycontroller");
  const auth = require("../middleware/auth");

  router.post("/", auth, (req, res) => createDelivery(req, res, io));

  return router;
};