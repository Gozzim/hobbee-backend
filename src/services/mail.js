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

async function sendResetPassword(user, newPassword) {
  const content ="Hi, " + user.username + " your new password is " + newPassword; // TODO Mail Template
  await sendMail(user.email, "Your New Hobb.ee Password", content);
}

async function sendAccountConfirmation(user) {
  const content = "Hello " + user.username + " and welcome to Hobb.ee!"; // TODO Mail Template
  await sendMail(user.email, "Welcome to Hobb.ee!", content);
}

async function sendFeedbackForm(user, feedback) {
  const content = "Hello " + user.username + " and welcome to Hobb.ee!"; // TODO Mail Template
  await sendMail(user.email, "Welcome to Hobb.ee!", content);
}

module.exports = {
  sendMail,
  sendResetPassword,
  sendAccountConfirmation,
  sendFeedbackForm,
};
