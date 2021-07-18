"use strict";

const { MAIL_REGEX, USERNAME_REGEX, PASS_REGEX } = require("../shared/Constants");

async function isValidEmail(email) {
  const exists = await UserModel.findOne({ email: email }).collation({locale: 'en', strength: 2})
  return email && typeof email === "string" && !exists && MAIL_REGEX.test(email.toLowerCase());
}

async function isValidPassword(pass) {
  return pass && typeof pass === "string" && PASS_REGEX.test(pass);
}

async function isValidUsername(name) {
  return name && typeof name === "string" && USERNAME_REGEX.test(name);
}

async function isValidDateOfBirth(bday) {
  const minAge = new Date();
  minAge.setFullYear(minAge.getFullYear() - 18);

  return bday && bday <= minAge;
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  isValidDateOfBirth,
};
