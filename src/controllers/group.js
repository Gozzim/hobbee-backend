const GroupModel = require("../models/group");
const TagModel = require("../models/tag");
const UserModel = require("../models/user");
const ChatMessageModel = require("../models/chatMessage");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { emitSystemMessage } = require("../services/socket");
const { processChatData } = require("../services/socket");

const create = async (req, res) => {
  if (!Object.prototype.hasOwnProperty.call(req.body, "groupName"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a groupName property",
    });

  if (!Object.prototype.hasOwnProperty.call(req.body, "city"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a city property",
    });
  if (!Object.prototype.hasOwnProperty.call(req.body, "onOffline"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a onOffline property",
    });

  if (
    !Object.prototype.hasOwnProperty.call(req.body, "tags") ||
    !Array.isArray(req.body.tags)
  )
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a tags property",
    });
  if (!Object.prototype.hasOwnProperty.call(req.body, "pic"))
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a pic property",
    });

  try {
    const user = await UserModel.findById(req.userId).exec();
    const message = {
      message: user.username + " created " + req.body.groupName,
      timestamp: Date.now(),
      isSystemMessage: true,
    };
    const creationMessage = await ChatMessageModel.create(message);
    const group = {
      groupName: req.body.groupName,
      groupOwner: req.userId,
      groupMembers: [req.userId],
      city: req.body.city,
      onOffline: req.body.onOffline,
      tags: req.body.tags,
      pic: req.body.pic,
      participants: req.body.participants || 0,
      date: req.body.date ? [req.body.date] : [],
      location: req.body.location,
      description: req.body.description,
      chat: [creationMessage._id],
    };

    await GroupModel.create(group);
    return res.status(200).json({});
  } catch (err) {
    console.log(err);
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
    console.log(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await GroupModel.find().exec();
    return res.status(200).json(groups);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const getGroup = async (req, res) => {
  const id = req.params.groupId;
  let userId;

  if (req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, config.JwtSecret, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          error: "Unauthorized",
          message: "Failed to authenticate token.",
        });
      }
      userId = decoded._id;
    });
  }

  try {
    const group = await GroupModel.findOne({ _id: id })
      .populate({ path: "groupMembers" })
      .populate({ path: "groupOwner" })
      .populate({ path: "chat" })
      .exec();
    if (userId) {
      const extendedGroup = await GroupModel.findOne({
        _id: id,
        groupMembers: userId,
      }).exec();
      if (extendedGroup) {
        return res.status(200).json(group);
      }
    }
    const answer = {
      _id: group._id,
      groupName: group.groupName,
      groupOwner: group.groupOwner,
      groupMembers: group.groupMembers,
      city: group.city,
      onOffline: group.onOffline,
      tags: group.tags,
      participants: group.participants,
      pic: group.pic,
      date: group.date,
      description: group.description || null,
    };
    return res.status(200).json(answer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const joinGroup = async (req, res) => {
  //initialization
  const id = req.params.groupId;
  const userId = req.userId;

  try {
    //get group and user
    const group = await GroupModel.findOne({ _id: id }).exec();
    const user = await UserModel.findById(userId).exec();

    //is user in group?
    if (group.groupMembers.includes(userId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "User is already in group.",
      });
    }
    //is group full?
    if (group.participants <= group.groupMembers.length) {
      return res.status(400).json({
        error: "Bad Request",
        message: "This group is full.",
      });
    }
    //has user reached group limit?
    const groupsWithUser = await GroupModel.find({ groupMembers: userId })
      .countDocuments()
      .exec();
    if (!user.premium && groupsWithUser >= 5) {
      return res.status(400).json({
        error: "Bad Request",
        message: "You can't join any more groups",
      });
    }

    //add user to group members
    const updatedGroupMembers = group.groupMembers;
    updatedGroupMembers.push(userId);
    //add join message
    const message = {
      message: user.username + " joined the chat",
      timestamp: Date.now(),
      isSystemMessage: true,
    };
    const newMessage = await ChatMessageModel.create(message);
    const newChat = group.chat;
    newChat.push(newMessage._id);
    //update group
    await GroupModel.updateOne(
      { _id: id },
      {
        groupMembers: updatedGroupMembers,
        chat: newChat,
      }
    );
    emitSystemMessage(newChat);
    return res.status(200).json("Joined group!");
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const leaveGroup = async (req, res) => {
  //initialization
  const id = req.params.groupId;
  const userId = req.userId;

  try {
    //get group and user
    const group = await GroupModel.findOne({ _id: id }).exec();
    const user = await UserModel.findById(userId).exec();

    //is user in group?
    if (!group.groupMembers.includes(userId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "User is not in this group.",
      });
    }
    //is user last man standing?
    if (group.groupMembers.length === 1) {
      //group owner tries to leave as only member left
      return res.status(400).json({
        error: "Bad Request",
        message: "You cannot leave the group if you're the only one in it.",
      });
    }

    //leave group members
    const index = group.groupMembers.indexOf(userId);
    const updatedGroupMembers = group.groupMembers;
    if (index > -1) {
      updatedGroupMembers.splice(index, 1);
    }
    //add leave message
    const newChat = group.chat;
    const leaveMessage = {
      message: user.username + " left the chat",
      timestamp: Date.now(),
      isSystemMessage: true,
    };
    const newLeaveMessage = await ChatMessageModel.create(leaveMessage);
    newChat.push(newLeaveMessage._id);

    //user is group owner
    if (group.groupOwner === userId) {
      //ownership transfer message
      const newOwner = await UserModel.findById(updatedGroupMembers[0]).exec();
      const ownerMessage = {
        message: newOwner.username + " is now the group owner",
        timestamp: Date.now(),
        isSystemMessage: true,
      };
      const newOwnerMessage = await ChatMessageModel.create(ownerMessage);
      newChat.push(newOwnerMessage._id);
      //update group
      await GroupModel.updateOne(
        { _id: id },
        {
          groupOwner: updatedGroupMembers[0],
          groupMembers: updatedGroupMembers,
          chat: newChat,
        }
      );
      emitSystemMessage(newChat);
      return res.status(200).json("Left group!");
    } else {
      //user is not group owner
      await GroupModel.updateOne(
        { _id: id },
        {
          groupMembers: updatedGroupMembers,
          chat: newChat,
        }
      );
      emitSystemMessage(newChat);
      return res.status(200).json("Left group!");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const getProcessedGroupChat = async (req, res) => {
  //initialization
  const id = req.params.groupId;

  try {
    //get group
    const group = await GroupModel.findById(id).exec();

    //process chat
    const plainChat = group.chat;
    const newChat = await processChatData(plainChat);
    return res.status(200).json(newChat);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

module.exports = {
  create,
  getTags,
  getGroups,
  getGroup,
  joinGroup,
  leaveGroup,
  getProcessedGroupChat,
};
