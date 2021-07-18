const { ERRORS } = require("../shared/Constants");
const { getPayPalSubscription } = require("../services/payment");
const UserModel = require("../models/user");
const { errorHandler } = require("../middlewares");
const { generateToken } = require("./auth");

const handlePremiumRequest = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["subscriptionID"]);
  if (error) {
    return error;
  }

  // TODO: What about outstanding_balance?
  const order = await getPayPalSubscription(req.body.subscriptionID);

  if (!order) {
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

    console.log(order);

    user.premium.subscription.id = order.id;
    user.premium.subscription.plan = order.plan_id;
    user.premium.subscription.expiration = order.billing_info.next_billing_time;
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


module.exports = {
  handlePremiumRequest,
};
