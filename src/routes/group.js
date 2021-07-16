const express = require("express");
const router = express.Router();

const GroupController = require("../controllers/group");
const middlewares = require("../middlewares");

router.post("/create", middlewares.checkAuthentication, GroupController.create);
router.get("/tags", GroupController.getTags);
router.get("/groups", GroupController.getGroups);
router.get("/group/:groupId", GroupController.getGroup);

module.exports = router;
