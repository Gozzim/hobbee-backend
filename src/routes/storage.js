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
  "/file/upload",
  middlewares.checkAuthentication,
  StorageController.uploadFile
);

router.get("/file/view/:fileId", StorageController.viewFile);

router.post(
  "/feedback/:id",
  middlewares.checkAuthentication,
  StorageController.handleFeedback
);

module.exports = router;
