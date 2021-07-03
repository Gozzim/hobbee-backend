const express = require("express");
const router = express.Router();

const GroupController = require("../controllers/group");

router.post("/create", GroupController.create);
router.get("/tags", GroupController.getTags);

module.exports = router;
