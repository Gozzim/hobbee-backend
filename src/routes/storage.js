"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const StorageController = require("../controllers/storage");

router.get(
  "/notifications",
  middlewares.checkAuthentication,
  StorageController.getUserNotifications
);

router.post(
  "/notifications/read/:notification",
  middlewares.checkAuthentication,
  StorageController.setNotificationRead
);

router.post(
  "/notifications/clear",
  middlewares.checkAuthentication,
  StorageController.clearNotifications
);

router.post(
  "/file/upload",
  middlewares.checkAuthentication,
  StorageController.uploadFile
);

router.get("/file/view/:fileId", StorageController.viewFile);

module.exports = router;
