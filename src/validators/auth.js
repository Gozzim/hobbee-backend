"use strict";

const { MAIL_REGEX, USERNAME_REGEX, PASS_REGEX } = require("./regex_exp");

// Requires Email to be lower characters only.
async function isValidEmail(email) {
  return email && typeof email === "string" && MAIL_REGEX.test(email);
}

async function isValidPassword(pass) {
  return pass && typeof pass === "string" && PASS_REGEX.test(pass);
}

async function isValidUsername(name) {
  return name && typeof name === "string" && USERNAME_REGEX.test(name);
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUsername,
};
