"use strict";

const dotenv = require ("dotenv");

dotenv.config();

// Configuration variables
const port = process.env.PORT || "4000";
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/hobbee";
const frontendDomain = process.env.FRONTEND_DOMAIN || "http://localhost:3000";
const JwtSecret = process.env.JWT_SECRET || "OJ7syYo9hDcFni4LuAQHW6JkeJpOkbc8";
const mailUser = process.env.MAIL_USER || "contact@hobb.ee";
const mailPass = process.env.MAIL_PASS || "ytrcliovllflmzgu";
const mailDomain = process.env.MAIL_DOMAIN || "smtp.zone.eu";
const mailPort = process.env.MAIL_PORT || 465;
const paypalClient = process.env.PAYPAL_CLIENT || "AU7zuQUIr6Py3Vyt85-b8wASl7rWeaaoTc1ETAAx0xM7PUygJoVmxGDkPEzSC8obakqZ7C8y976kbZrM";
const paypalSecret = process.env.PAYPAL_SECRET || "EMgZiiNsARtF50N4zw9jesLbHLoxBqNa7KanjSAlrF4lyjVa6YNlIMVo2lhR9qcnCxxFPZ6IijrZEB-i";

module.exports = {
  port,
  mongoURI,
  frontendDomain,
  JwtSecret,
  mailUser,
  mailPass,
  mailDomain,
  mailPort,
  paypalClient,
  paypalSecret,
};
