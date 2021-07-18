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

module.exports = {
  getPlanIdFromRequest,
};