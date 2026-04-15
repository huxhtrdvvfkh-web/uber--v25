module.exports = (io) => {
  const express = require("express");
  const router = express.Router();
  const { updateCourier } = require("../controllers/couriercontroller");

  router.post("/location", (req, res) => updateCourier(req, res, io));

  return router;
};