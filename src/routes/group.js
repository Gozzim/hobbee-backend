const express = require("express");
const router = express.Router();

const GroupController = require("../controllers/group");
const middlewares = require("../middlewares");

router.post("/create", middlewares.checkAuthentication, GroupController.create); // prettier-ignore
router.get("/tags", GroupController.getTags); // prettier-ignore
router.get("/groups", GroupController.getGroups); // prettier-ignore
router.get("/group/:groupId", middlewares.extractUserId, GroupController.getGroup); // prettier-ignore
router.get("/mine", middlewares.checkAuthentication, GroupController.mine); // prettier-ignore
router.get("/recommended", middlewares.checkAuthentication, GroupController.recommended); // prettier-ignore
router.get("/in-my-area", middlewares.checkAuthentication, GroupController.inMyArea); // prettier-ignore
router.post("/join/:groupId", middlewares.checkAuthentication, GroupController.joinGroup); // prettier-ignore
router.post("/leave/:groupId", middlewares.checkAuthentication, GroupController.leaveGroup); // prettier-ignore
router.post("/edit/:groupId", middlewares.checkAuthentication, GroupController.editGroup); // prettier-ignore
router.post("/delete/:groupId", middlewares.checkAuthentication, GroupController.deleteGroup); // prettier-ignore
router.get("/chat/:groupId", GroupController.getProcessedGroupChat); // prettier-ignore

module.exports = router;
