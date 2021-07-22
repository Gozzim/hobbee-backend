"use strict";

const { GROUPNAME_REGEX } = require("../shared/Constants");

async function isValidGroupName(name) {
  return name && typeof name === "string" && GROUPNAME_REGEX.test(name);
}

async function isValidDate(date) {
  const now = new Date();
  return (date && date > now) || date === null;
}

module.exports = {
  isValidGroupName,
  isValidDate,
};
