const express = require("express");
const router = express.Router();

const GroupController = require("../controllers/group");
const middlewares = require("../middlewares");

router.post("/create", middlewares.checkAuthentication, GroupController.create);
router.get("/tags", GroupController.getTags);
router.get("/groups", GroupController.getGroups);
router.get("/group/:groupId", GroupController.getGroup);
router.post("/join-group/:groupId", middlewares.checkAuthentication, GroupController.joinGroup);
router.post("/leave-group/:groupId", middlewares.checkAuthentication, GroupController.leaveGroup);
router.get("/group-chat/:groupId", GroupController.getProcessedGroupChat);

module.exports = router;
