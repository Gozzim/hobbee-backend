"use strict";

const nodemailer = require("nodemailer");
const config = require("../config");
const { htmlToText } = require("html-to-text");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

// Template resource: https://github.com/leemunroe/responsive-html-email-template
const template = fs.readFileSync(path.join(__dirname, "./mailTemplates/mailTemplate.html"), "utf8");

const transport = nodemailer.createTransport({
  host: config.mailDomain,
  port: config.mailPort,
  auth: {
    user: config.mailUser,
    pass: config.mailPass,
  },
});

async function sendMail(to, subject, html) {
  const text = htmlToText(html);
  const mailOptions = {
    from: "Hobb.ee Support <contact@hobb.ee>",
    to: to,
    subject: subject,
    text: text,
    html: html,
  };
  return transport.sendMail(mailOptions);
}

async function sendGenericMail(user, title, content) {
  const html = ejs.render(template, {
    title,
    user: user.username,
    content,
  });
  await sendMail(user.email, title, html);
}

async function sendResetPassword(user, link) {
  const html = ejs.render(template, {
    title: "Hobb.ee Account Recovery",
    user: user.username,
    content: "You can change your Password under " + link,
  });
  await sendMail(user.email, "Hobb.ee Account Recovery", html);
}

async function sendFeedbackForm(user, feedback) {
  const html = ejs.render(template, {
    title: "Hobb.ee Feedback",
    user: user.username,
    content: "Please provide feedback about your experience under " + feedback,
  });
  await sendMail(user.email, "How was your experience?", html);
}

async function sendPremiumConfirmation(user) {
  const html = ejs.render(template, {
    title: "Hobb.ee Premium",
    user: user.username,
    content: "Thank you for buying a premium subscription with Hobb.ee.",
  });
  await sendMail(user.email, "Hobb.ee Premium", html);
}

module.exports = {
  sendGenericMail,
  sendResetPassword,
  sendFeedbackForm,
  sendPremiumConfirmation,
};
