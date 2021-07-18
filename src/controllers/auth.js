"use strict";

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const config = require("../config");
const UserModel = require("../models/user");
const ResetTokenModel = require("../models/resetToken");
const { generateToken } = require("../shared/helpers");
const { renewSubscription } = require("./payment");
const { ERRORS } = require("../shared/Constants");
const { isValidEmail } = require("../validators/auth");
const { errorHandler } = require("../middlewares");
const {
  sendResetPassword,
  sendConfirmChange,
  sendAccountConfirmation,
} = require("../services/mail");
const { isValidPassword } = require("../validators/auth");

const login = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["username", "password"]);
  if (error) {
    return error;
  }

  try {
    // Check if user is logging in with Email or Username
    const isEmail = await isValidEmail(req.body.username);
    let user;
    if (isEmail) {
      user = await UserModel.findOne({
        email: req.body.username,
      })
        .select("username password premium.active premium.subscription.expiration premium.subscription.id");
    } else {
      user = await UserModel.findOne({
        username: req.body.username,
      })
        .select("username password premium.active premium.subscription.expiration premium.subscription.id");
    }
    //console.log(user);

    // check if the password is valid
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).send({ token: null });
    }

    // check if premium has expired
    if (user.premium.active) {
      const premiumExpiration = Date.parse(user.premium.subscription.expiration);
      if (Date.now() > premiumExpiration) {
        user.premium = await renewSubscription(user.premium.subscription.id);
        await user.save();
      }
    }

    const token = await generateToken(user);

    return res.status(200).json({
      token: token,
    });
  } catch (err) {
    return res.status(404).json({
      error: "Not Found",
      message: err.message,
    });
  }
};

const register = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["username", "email", "password", "dateOfBirth"]);
  if (error) {
    return error;
  }

  try {
    // Password validation before hashing
    const isPassValid = await isValidPassword(req.body.password);
    if (!isPassValid) {
      return res.status(400).json({
        error: "Bad Request",
        message: ERRORS.invalidPassword,
      });
    }

    // hash the password before storing it in the database
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    // create a user object
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      dateOfBirth: req.body.dateOfBirth,
      hobbies: req.body.hobbies,
    };

    // create the user in the database
    let retUser = await UserModel.create(user);

    // Send Email to user
    await sendAccountConfirmation(user);

    // create a token
    const token = await generateToken(retUser);
    res.status(200).json({
      token: token,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: ERRORS.userAlreadyExists,
        message: err.message,
      });
    } else {
      return res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    }
  }
};

const forgotPassword = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["email"]);
  if (error) {
    return error;
  }

  try {
    const user = await UserModel.findOne({ email: req.body.email }).exec();
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "No user with this email found",
      });
    }

    let token = await ResetTokenModel.findOne({ user: user._id });
    if (token) {
      await token.delete();
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    // Hashing Token. Saving plain token is comparable to saving plain passwords
    const tokenHash = await bcrypt.hash(resetToken, 8);
    const newToken = {
      user: user._id,
      token: tokenHash,
    };
    await ResetTokenModel.create(newToken);

    // Generate link with userId and token for validation while resetting the password
    const link = `${config.frontendDomain}/password-reset/${user._id}/${resetToken}`;
    await sendResetPassword(user, link);

    return res.status(200).send({});
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["user", "token", "password"]);
  if (error) {
    return error;
  }

  try {
    let resetToken = await ResetTokenModel.findOne({ user: req.body.user });
    if (!resetToken) {
      return res.status(400).json({
        error: "Bad Request",
        message: ERRORS.invalidRecoveryToken,
      });
    }

    const isValidToken = bcrypt.compareSync(req.body.token, resetToken.token);
    if (!isValidToken) {
      return res.status(400).json({
        error: "Bad Request",
        message: ERRORS.invalidRecoveryToken,
      });
    }

    // Password validation before hashing
    const isPassValid = await isValidPassword(req.body.password);
    if (!isPassValid) {
      return res.status(400).json({
        error: "Bad Request",
        message: ERRORS.invalidPassword,
      });
    }

    // hash the password before storing it in the database
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    const user = await UserModel.findById(req.body.user).select("username premium.active premium.subscription.expiration premium.subscription.id");
    if (!user) {
      // Should never happen
      return res.status(404).json({
        error: "Not Found",
        message: ERRORS.userNotFound,
      });
    }
    user.password = hashedPassword;

    // Finalize modifications and send confirmation mail
    await user.save();
    await resetToken.delete();
    await sendConfirmChange(user);

    // Check premium status to prevent abuse
    if (user.premium.active) {
      const premiumExpiration = Date.parse(user.premium.subscription.expiration);
      if (Date.now() > premiumExpiration) {
        user.premium = await renewSubscription(user.premium.subscription.id);
        await user.save();
      }
    }

    // Generate JWT token to log user in again right away
    const token = await generateToken(user);
    res.status(200).json({
      token: token,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const me = async (req, res) => {
  try {
    // get own user from database
    let user = await UserModel.findById(req.userId).exec();

    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: ERRORS.userNotFound,
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const isUsernameAvailable = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["username"]);
  if (error) {
    return error;
  }

  try {
    const user = await UserModel.findOne({ username: req.body.username }).exec();

    return res.status(200).json({
      isUsernameAvailable: !user,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const logout = (req, res) => {
  res.status(200).send({ token: null });
};

module.exports = {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  me,
  isUsernameAvailable,
};
