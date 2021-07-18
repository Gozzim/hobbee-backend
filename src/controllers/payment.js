const { ERRORS } = require("../shared/Constants");
const {
  payPalSubscriptionRequest,
  cancelPayPalSubscriptionRequest,
} = require("../services/payment");
const UserModel = require("../models/user");
const { generateToken } = require("../shared/helpers");
const { errorHandler } = require("../middlewares");

const renewSubscription = async (subscriptionId) => {
  const subscription = await payPalSubscriptionRequest(subscriptionId);

  if (!subscription || subscription.status !== "ACTIVE") {
    return { active: false };
  }

  return {
    active: true,
    subscription: {
      id: subscription.id,
      plan: subscription.plan_id,
      expiration: subscription.billing_info.next_billing_time,
    },
  };
};

const handlePremiumRequest = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["subscriptionID"]);
  if (error) {
    return error;
  }

  // TODO: What about outstanding_balance?
  const subscription = await payPalSubscriptionRequest(req.body.subscriptionID);

  if (!subscription || subscription.status !== "ACTIVE") {
    return res.status(400).json({
      error: "Bad Request",
      message: "The subscription is not active",
    });
  }

  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      // Should never happen
      return res.status(404).json({
        error: "Not Found",
        message: ERRORS.userNotFound,
      });
    }

    if (user.premium.active) {
      // TODO: Handle cancel payment
      console.log("Already has premium");
    }

    user.premium.subscription.id = subscription.id;
    user.premium.subscription.plan = subscription.plan_id;
    user.premium.subscription.expiration = subscription.billing_info.next_billing_time;
    user.premium.active = true;
    await user.save();

    const token = await generateToken(user);
    return res.status(200).json({ token: token });
  } catch (e) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: e.message,
    });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select(
      "premium.active premium.subscription.id"
    );
    if (!user) {
      // Should never happen
      return res.status(404).json({
        error: "Not Found",
        message: ERRORS.userNotFound,
      });
    }

    if (user.premium.active) {
      const cancelReq = await cancelPayPalSubscriptionRequest(user.premium.subscription.id);

      // If cancel was successful
      if (cancelReq.status === 204) {
        return res.status(200).json();
      }
    }

    return res.status(400).json({
      error: "Bad Request",
      message: "Subscription could not be canceled",
    });
  } catch (e) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: e.message,
    });
  }
};

module.exports = {
  renewSubscription,
  handlePremiumRequest,
  cancelSubscription,
};
