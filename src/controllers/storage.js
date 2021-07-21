"use strict";

const datefns = require("date-fns");
const mongoose = require("mongoose");

const config = require("../config");
const FileModel = require("../models/file");
const NotificationModel = require("../models/notification");
const GroupModel = require("../models/group");
const FeedbackModel = require("../models/feedback");
const { errorHandler } = require("../middlewares");
const { sendFeedbackForm } = require("../services/mail");

const getUserNotifications = async (req, res) => {
  try {
    const since = datefns.parseISO(req.query.since);
    const response = await NotificationModel.find({
      user: req.userId,
      date: { $gt: since },
    })
      .lean()
      .populate("group", "groupName")
      .sort("date")
      .exec();

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: e.message,
    });
  }
};

const uploadFile = async (req, res) => {
  try {
    const file = await FileModel.create({
      _id: new mongoose.Types.ObjectId().toString(),
      mimeType: req.files.file.mimetype,
      data: req.files.file.data,
    });
    return res.status(200).json({ id: file._id });
  } catch (e) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: e.message,
    });
  }
};

const viewFile = async (req, res) => {
  const id = req.params.fileId;

  try {
    const file = await FileModel.findById(id).exec();
    res.set("Content-Type", file.mimeType);
    res.set("Content-Disposition", "inline;");
    return res.status(200).send(file.data);
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const handleFeedback = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["rating", "comment"]);
  if (error) {
    return error;
  }

  try {
    const feedback = FeedbackModel.find({ _id: req.params.id, user: req.userId });
    if (!feedback) {
      return res.status(404).json({
        error: "Not Found",
        message: "Feedback id not found",
      });
    }

    if (!Array.isArray(req.body.rating) || req.body.length === 4) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid feedback data",
      });
    }

    feedback.ratings = req.body.ratings;
    feedback.comment = req.body.comment;
    await feedback.save();
    return res.status(200).json();
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const groupMetCheck = async () => {
  try {
    const groups = await GroupModel.find({
      date: { $lt: Date.now() },
      feedbackSent: false,
    })
      .lean()
      .populate("groupMembers", "username email");

    groups.map(async (group) => {
      await Promise.all(
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
        })
      );
      group.feedbackSent = true;
      await group.save();
    });
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = {
  getUserNotifications,
  uploadFile,
  viewFile,
  handleFeedback,
  groupMetCheck,
};
