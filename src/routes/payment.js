"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const PaymentController = require("../controllers/payment");

router.post("/subscribe", middlewares.checkAuthentication, PaymentController.handlePremiumRequest);


module.exports = router;
