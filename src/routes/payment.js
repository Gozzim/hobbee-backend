"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const PaymentController = require("../controllers/payment");

router.post("/subscribe", middlewares.checkAuthentication, PaymentController.handlePremiumRequest);
router.get("/cancel", middlewares.checkAuthentication, PaymentController.cancelSubscription);

module.exports = router;
