"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const StorageController = require("../controllers/storage");

router.get("/notifications", middlewares.checkAuthentication, StorageController.getUserNotifications);


module.exports = router;