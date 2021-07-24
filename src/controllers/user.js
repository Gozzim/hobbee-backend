const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const config = require("../config");
const UserModel = require("../models/user");
const UserReportModel = require("../models/userReport");
const { ERRORS } = require("../shared/Constants");
const ResetTokenModel = require("../models/resetToken");
const { sendConfirmChange, sendResetPassword } = require("../services/mail");
const { generateToken } = require("../shared/helpers");
const { isValidPassword } = require("../validators/auth");
const { errorHandler } = require("../middlewares");

const forgotPassword = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["email"]);
  if (error) {
    return error;
  }

  try {
    const user = await UserModel.findOne({ email: req.body.email }).select("username email");
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
    const user = await UserModel.findById(req.body.user);
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

    // Generate JWT token to log user in again right away
    const token = await generateToken(user);
    res.status(200).json({
      token: token,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const me = async (req, res) => {
  try {
    // get own user from database
    const user = await UserModel.findById(req.userId)
      .select(
        "username email dateOfBirth city avatar hobbies premium.active premium.subscription.expiration premium.canceled premium.subscription.plan"
      )
      .exec();

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

const getUser = async (req, res) => {
  try {
    // get user from database
    const user = await UserModel.findOne({username: req.params.username}).collation({ locale: "en", strength: 2 }).exec();

    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: ERRORS.userNotFound,
      });
    }
    console.log(user);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
};


const updateMe = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["username", "email", "dateOfBirth"]);
  if (error) {
    return error;
  }

  try {
    let user = await UserModel.findById(req.userId).select("username email dateOfBirth city avatar hobbies premium.active premium.expiration premium.canceled premium.subscription.plan");

    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: ERRORS.userNotFound,
      });
    }

    user.username = req.body.username;
    user.email = req.body.email;
    user.dateOfBirth = req.body.dateOfBirth;
    await user.save();

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const createUserReport = async (req, res) => {
  try {
    // get users from database
    let reportedUser = await UserModel.findOne({username: req.params.username}).collation({ locale: "en", strength: 2 }).exec();
    let sendingUser = await UserModel.findById(req.userId).exec();

    if (!reportedUser) {
      return res.status(404).json({
        error: "No User to report on",
        message: ERRORS.userNotFound,
      });
    }

    const userReport = {
      sendingUser: sendingUser._id,
      reportedUser: reportedUser._id,
      inappropriateUsername: req.body.reportForm.inappropriateUsername,
      threatsEtc: req.body.reportForm.threatsEtc,
      hateSpeechEtc: req.body.reportForm.hateSpeechEtc,
      spamEtc: req.body.reportForm.spamEtc,
      inappropriateContent: req.body.reportForm.inappropriateContent,
      noShow: req.body.reportForm.noShow,
      other: req.body.reportForm.other,
      comment: req.body.reportForm.comment,
    }

    await UserReportModel.create(userReport);

    return res.status(200).json("Report successful!");
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
}

module.exports = {
  forgotPassword,
  resetPassword,
  me,
  getUser,
  updateMe,
  createUserReport,
};
