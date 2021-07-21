const jwt = require("jsonwebtoken");

const config = require("../config");
const { SUBSCRIPTION_PLAN } = require("./Constants");

const getPlanFromId = async (planId) => {
  switch (planId) {
    case SUBSCRIPTION_PLAN.elite:
      return "Elite (12 Months)";
    case SUBSCRIPTION_PLAN.advanced:
      return "Advanced (3 Months)";
    case SUBSCRIPTION_PLAN.standard:
      return "Standard (1 Month)";
    default:
      return "No Premium :(";
  }
};

const generateToken = async (user) => {
  return jwt.sign(
    { _id: user._id, username: user.username, hasPremium: user.premium.active },
    config.JwtSecret,
    {
      expiresIn: 24 * 60 * 60,
    }
  );
};

module.exports = {
  getPlanFromId,
  generateToken,
};