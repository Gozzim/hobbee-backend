const express = require("express");
const router = express.Router();

const GroupController = require("../controllers/group");
const middlewares = require("../middlewares");

router.post("/create", middlewares.checkAuthentication, GroupController.create);
router.get("/tags", GroupController.getTags);
router.get("/groups", GroupController.getGroups);
router.get("/group/:groupId", middlewares.extractUserId, GroupController.getGroup);
router.get("/mine", middlewares.checkAuthentication, GroupController.mine);
router.post("/join/:groupId", middlewares.checkAuthentication, GroupController.joinGroup);
router.post("/leave/:groupId", middlewares.checkAuthentication, GroupController.leaveGroup);
router.post("/edit/:groupId", middlewares.checkAuthentication, GroupController.editGroup);
router.post("/delete/:groupId", middlewares.checkAuthentication, GroupController.deleteGroup);
router.get("/chat/:groupId", GroupController.getProcessedGroupChat);

module.exports = router;
