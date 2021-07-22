"use strict";

const schedule = require("node-schedule");

const config = require("../config");
const NotificationModel = require("../models/notification");
const FeedbackModel = require("../models/feedback");
const GroupModel = require("../models/group");
const { sendFeedbackForm } = require("../services/mail");

const groupMetCheck = async () => {
  try {
    const groups = await GroupModel.find({
      date: { $lt: Date.now() },
      feedbackSent: false,
    })
      .lean()
      .populate("groupMembers", "username email");

    groups.map((group) => {
      group.groupMembers.map(async (member) => {
        const feedback = await FeedbackModel.create({
          user: member._id,
          group: group._id,
        });
        await NotificationModel.create({
          user: member._id,
          group: group._id,
          notificationType: "Feedback",
          content: "Please provide feedback on your experience.",
        });
        const link = `${config.frontendDomain}/feedback/${feedback._id}`;
        await sendFeedbackForm(member, link);
      });
      GroupModel.updateOne(
        { _id: group._id },
        { $set: { feedbackSent: true } }
      );
    });
  } catch (e) {
    console.log(e.message);
  }
};

const runPeriodicTasks = () => {
  schedule.scheduleJob("0 8 * * *", groupMetCheck); // Daily at 8am
};

module.exports = {
  runPeriodicTasks,
};
