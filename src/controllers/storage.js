"use strict";

const mongoose = require("mongoose");

const FileModel = require("../models/file");
const NotificationModel = require("../models/notification");
const FeedbackModel = require("../models/feedback");
const TagModel = require("../models/tag");
const { errorHandler } = require("../middlewares");

const getUserNotifications = async (req, res) => {
  try {
    const response = await NotificationModel.find({
      user: req.userId,
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

const setNotificationRead = async (req, res) => {
  try {
    await NotificationModel.deleteOne({
      _id: req.params.notification,
      user: req.userId,
    });

    return res.status(200).json();
  } catch (e) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: e.message,
    });
  }
};

const clearNotifications = async (req, res) => {
  try {
    await NotificationModel.deleteMany({user: req.userId});

    return res.status(200).json();
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

const handleFeedbackSubmission = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["ratings", "comment"]);
  if (error) {
    return error;
  }

  try {
    const feedback = await FeedbackModel.findOne({ _id: req.params.id, user: req.userId });
    if (!feedback) {
      return res.status(404).json({
        error: "Not Found",
        message: "Feedback id not found",
      });
    }

    if (!Array.isArray(req.body.ratings) || req.body.length === 4) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid feedback data",
      });
    }

    feedback.ratings = req.body.ratings;
    feedback.comment = req.body.comment;
    feedback.completed = true;
    await feedback.save();

    await NotificationModel.deleteOne({user: req.userId, group: feedback.group, notificationType: "Feedback"});

    return res.status(200).json();
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const handleFeedbackRequest = async (req, res) => {
  try {
    const feedback = await FeedbackModel.findOne({ _id: req.params.id, user: req.userId, completed: false }).populate("group", "groupName");
    if (!feedback) {
      return res.status(404).json({
        error: "Not Found",
        message: "Invalid feedback link",
      });
    }

    return res.status(200).json(feedback.group);
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await TagModel.find({}).exec();
    return res.status(200).json(tags);
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

module.exports = {
  getUserNotifications,
  setNotificationRead,
  clearNotifications,
  uploadFile,
  viewFile,
  handleFeedbackSubmission,
  handleFeedbackRequest,
  getTags,
};
