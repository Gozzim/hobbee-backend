"use strict";

const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");
const AuthController = require("../controllers/auth");

router.post("/login", AuthController.login); // login
router.post("/register", AuthController.register); // register a new user
router.get("/me", middlewares.checkAuthentication, AuthController.me); // get own username, requires a logged in user
router.post("/logout", middlewares.checkAuthentication, AuthController.logout); // logout user
router.get("/:user", AuthController.getUsername);
router.post("/forgot", AuthController.forgotPassword); // Send reset password link to user
router.post("/reset", AuthController.resetPassword); // Change user password from reset link
router.post("/exists/username", AuthController.isUsernameAvailable);

module.exports = router;
