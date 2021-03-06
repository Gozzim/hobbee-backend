"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const AuthController = require("../controllers/auth");
const UserController = require("../controllers/user");

router.post("/login", AuthController.login); // login
router.post("/register", AuthController.register); // register a new user
router.post("/logout", middlewares.checkAuthentication, AuthController.logout); // logout user
router.post("/exists/username", AuthController.isUsernameAvailable);


router.post("/forgot", UserController.forgotPassword); // Send reset password link to user
router.post("/reset", UserController.resetPassword); // Change user password from reset link


module.exports = router;
