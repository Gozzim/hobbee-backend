"use strict";

const axios = require("axios");
axios.defaults.baseURL = "https://api-m.sandbox.paypal.com/v1/";

const config = require("../config");

let token = null;

const getPayPalAccessToken = async () => {
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

const getPayPalSubscription = async (subscriptionId) => {
  await getPayPalAccessToken();

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

module.exports = {
  getPayPalAccessToken,
  getPayPalSubscription,
};
