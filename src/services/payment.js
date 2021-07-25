"use strict";

const axios = require("axios");
axios.defaults.baseURL = "https://api-m.sandbox.paypal.com/v1/";

const config = require("../config");

let token = null;

const payPalAccessTokenRequest = async () => {
  const reqConfig = {
    headers: {
      Accept: "application/json",
    },
    auth: {
      username: config.paypalClient,
      password: config.paypalSecret,
    },
  };
  try {
    const resp = await axios.post(
      "oauth2/token",
      "grant_type=client_credentials",
      reqConfig
    );
    token = resp.data.access_token;
  } catch (e) {
    console.log(e.message);
  }
};

const payPalSubscriptionRequest = async (subscriptionId) => {
  await payPalAccessTokenRequest();

  const reqConfig = {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/json",
    },
  };

  try {
    const resp = await axios.get(
      "billing/subscriptions/" + subscriptionId,
      reqConfig
    );

    return resp.data;
  } catch (e) {
    return e.message;
  }
};

const cancelPayPalSubscriptionRequest = async (subscriptionId) => {
  await payPalAccessTokenRequest();

  const reqConfig = {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/json",
    },
  };

  try {
    const resp = await axios.post(
      "billing/subscriptions/" + subscriptionId + "/cancel",
      { reason: "User cancelled subscription" },
      reqConfig
    );

    return resp;
  } catch (e) {
    console.log(e.response.data)
    return e.message;
  }
};

module.exports = {
  payPalSubscriptionRequest,
  cancelPayPalSubscriptionRequest,
};
