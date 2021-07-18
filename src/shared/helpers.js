const jwt = require("jsonwebtoken");

const config = require("../config");
const { SUBSCRIPTION_PLAN } = require("./Constants");

const getPlanIdFromRequest = async (planId) => {
  switch (planId) {
    case 3:
      return SUBSCRIPTION_PLAN.elite;
    case 2:
      return SUBSCRIPTION_PLAN.advanced;
    case 1:
      return SUBSCRIPTION_PLAN.standard;
    default:
      return 0;
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
  getPlanIdFromRequest,
  generateToken,
};