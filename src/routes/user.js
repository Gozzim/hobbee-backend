"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const UserController = require("../controllers/user");


router.post("/forgot", UserController.forgotPassword); // Send reset password link to user
router.post("/reset", UserController.resetPassword); // Change user password from reset link
router.post("/update", middlewares.checkAuthentication, UserController.updateMe); // Update userdata from profile, requires a logged in user

router.get("/me", middlewares.checkAuthentication, UserController.me); // get own username, requires a logged in user


module.exports = router;
