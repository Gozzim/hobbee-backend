const { ERRORS } = require("../shared/Constants");
const {
  payPalSubscriptionRequest,
  cancelPayPalSubscriptionRequest,
} = require("../services/payment");
const UserModel = require("../models/user");
const { sendPremiumConfirmation } = require("../services/mail");
const { getPlanFromId, generateToken } = require("../shared/helpers");
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


  const subscription = await payPalSubscriptionRequest(req.body.subscriptionID);

  if (!subscription || subscription.status !== "ACTIVE") {
    return res.status(400).json({
      error: "Bad Request",
      message: "The subscription is not active",
    });
  }

  try {
    const user = await UserModel.findById(req.userId).select("username email premium.active");
    if (!user) {
      // Should never happen
      return res.status(404).json({
        error: "Not Found",
        message: ERRORS.userNotFound,
      });
    }

    user.premium.subscription.id = subscription.id;
    user.premium.subscription.plan = subscription.plan_id;
    user.premium.subscription.expiration = subscription.billing_info.next_billing_time;
    user.premium.cancelled = false;
    user.premium.active = true;
    await user.save();

    const plan = await getPlanFromId(subscription.plan_id);
    const date = (new Date(subscription.billing_info.last_payment.time)).toLocaleDateString();
    const renewal = (new Date(subscription.billing_info.next_billing_time)).toLocaleDateString();
    const receipt = {
      "First name": subscription.subscriber.name.given_name,
      "Last name": subscription.subscriber.name.surname,
      "E-mail address": subscription.subscriber.email_address,
      "Premium plan": plan,
      "Subscription date": date,
      "Amount": subscription.billing_info.last_payment.amount.value + " " + subscription.billing_info.last_payment.amount.currency_code,
      "Renewal date": renewal,
    };

    await sendPremiumConfirmation(user);

    const token = await generateToken(user);
    return res.status(200).json({ token: token, receipt: receipt });
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
        user.premium.cancelled = true;
        await user.save();
        return res.status(200).json();
      }
    }

    return res.status(400).json({
      error: "Bad Request",
      message: "Subscription could not be cancelled",
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
