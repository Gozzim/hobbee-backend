"use strict";

const nodemailer = require("nodemailer");
const config = require("../config");

const transport = nodemailer.createTransport({
  host: config.mailDomain,
  port: config.mailPort,
  auth: {
    user: config.mailUser,
    pass: config.mailPass,
  },
});

async function sendMail(to, subject, content) {
  const mailOptions = {
    from: "Hobb.ee Support <contact@hobb.ee>",
    to: to,
    subject: subject,
    text: content,
  };

  return transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}

async function sendResetPassword(user, link) {
  const content ="Hi, " + user.username + " you can change your Password under " + link; // TODO Mail Template
  await sendMail(user.email, "Change Hobb.ee Password", content);
}

async function sendConfirmChange(user) {
  const content = "Hello " + user.username + ", your account information has successfully been changed."; // TODO Mail Template
  await sendMail(user.email, "Your Hobb.ee Account", content);
}

async function sendAccountConfirmation(user) {
  const content = "Hello " + user.username + " and welcome to Hobb.ee!"; // TODO Mail Template
  await sendMail(user.email, "Welcome to Hobb.ee!", content);
}

async function sendFeedbackForm(user, feedback) {
  const content = "Hello " + user.username + ", please provide feedback about your experience under " + feedback; // TODO Mail Template
  await sendMail(user.email, "How was your experience?", content);
}

async function sendPremiumConfirmation(user, receipt) {
  const content = "Hello " + user.username + ", thank you for buying a premium subscription with Hobb.ee." + receipt; // TODO Mail Template
  await sendMail(user.email, "Hobb.ee Premium", content);
}

module.exports = {
  sendResetPassword,
  sendConfirmChange,
  sendAccountConfirmation,
  sendFeedbackForm,
  sendPremiumConfirmation,
};
