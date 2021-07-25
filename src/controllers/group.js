const mongoose = require("mongoose");

const GroupModel = require("../models/group");
const ChatMessageModel = require("../models/chatMessage");
const UserModel = require("../models/user");
const { errorHandler } = require("../middlewares");
const { processChatData } = require("../services/socket");

const create = async (req, res) => {
  // Check if body contains required properties
  const error = errorHandler(req, res, ["groupName", "city", "onOffline", "tags", "pic"]);
  if (error) {
    return error;
  }

  try {
    const user = await UserModel.findById(req.userId).exec();

    //has user reached group limit?
    const groupsWithUser = await GroupModel.find({
      $and: [
        {
          groupMembers: req.userId,
        },
        {
          $or: [{ date: null }, { date: { $gt: Date.now() } }],
        },
        {
          deleted: false,
        },
      ],
    })
      .countDocuments()
      .exec();
    if (!user.premium.active && groupsWithUser >= 5) {
      return res.status(400).json({
        error: "Bad Request",
        message: "You have reached your active group limit.",
      });
    }

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
      maxMembers: req.body.maxMembers || 0,
      date: req.body.date,
      location: req.body.location,
      description: req.body.description,
      chat: [creationMessage._id],
    };

    const groupDB = await GroupModel.create(group);
    return res.status(200).json({ id: groupDB._id });
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const groups = await GroupModel.find({deleted: false})
      .lean()
      .populate("groupMembers", "username premium.active")
      .populate("groupOwner", "username premium.active")
      .exec();
    return res.status(200).json(sortGroups(groups));
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const getGroup = async (req, res) => {
  const userId = req.userId;

  try {
    const group = await GroupModel.findById(req.params.groupId)
      .lean()
      .populate("groupMembers", "username premium.active")
      .populate("groupOwner", "username premium.active")
      .exec();

    if (!group) {
      return res.status(404).json({
        error: "Not Found",
        message: "Group not found.",
      });
    }

    if (
      !userId ||
      !group.groupMembers.some((member) => member._id.equals(userId))
    ) {
      delete group.location;
      delete group.chat;
    }
    return res.status(200).json(group);
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const mine = async (req, res) => {
  try {
    const groups = await GroupModel.find({ groupMembers: req.userId , deleted: false})
      .lean()
      .populate("groupMembers", "username premium.active")
      .populate("groupOwner", "username premium.active")
      .exec();
    return res.status(200).json(sortGroups(groups));
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const recommended = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
      .select("hobbies city")
      .exec();
    // Find all groups that have a tag that matches the user's hobbies
    const groups = await GroupModel.find({
      tags: {
        $elemMatch: { $in: user.hobbies },
      },
      city: user.city,
    })
      .lean()
      .populate("groupMembers", "username premium.active")
      .populate("groupOwner", "username premium.active")
      .exec();
    return res.status(200).json(sortGroups(groups));
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const inMyArea = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("city").exec();
    // Find all groups that have a tag that matches the user's hobbies
    const groups = await GroupModel.find({
      city: user.city,
    })
      .lean()
      .populate("groupMembers", "username premium.active")
      .populate("groupOwner", "username premium.active")
      .exec();
    return res.status(200).json(sortGroups(groups));
  } catch (err) {
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
        message: "You are already a member of this group.",
      });
    }
    //is group full?
    if (
      group.maxMembers != 0 &&
      group.maxMembers <= group.groupMembers.length
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message: "This group is full.",
      });
    }
    //has user reached group limit?
    const groupsWithUser = await GroupModel.find({
      $and: [
        {
          groupMembers: userId,
        },
        {
          $or: [{ date: null }, { date: { $gt: Date.now() } }],
        },
        {
          deleted: false,
        },
      ],
    })
      .countDocuments()
      .exec();
    if (!user.premium.active && groupsWithUser >= 5) {
      return res.status(400).json({
        error: "Bad Request",
        message: "You have reached your active group limit.",
      });
    }
    //has group expired?
    if (group.date && group.date < new Date()) {
      return res.status(400).json({
        error: "Bad Request",
        message: "You can't join a group that has expired.",
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
    return res.status(200).json("Joined group!");
  } catch (err) {
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
        message: "Your are not a member of this group.",
      });
    }
    //is user last man standing?
    if (group.groupMembers.length === 1) {
      //group owner tries to leave as only member left
      return res.status(400).json({
        error: "Bad Request",
        message: "You can't leave a group when you are the only member.",
      });
    }
    //has group expired?
    if (group.date && group.date < new Date()) {
      return res.status(400).json({
        error: "Bad Request",
        message: "You can't leave a group that has expired.",
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
    if (String(group.groupOwner) === userId) {
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
      return res.status(200).json("Left group!");
    }
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const editGroup = async (req, res) => {
  //initialization
  const id = req.params.groupId;
  const userId = req.userId;

  try {
    //get group and user
    const group = await GroupModel.findById(id)
      .populate("groupMembers", "username premium.active")
      .populate("groupOwner", "username premium.active");

    //is user in group?
    if (!group.groupMembers.some((member) => member._id.equals(userId))) {
      return res.status(400).json({
        error: "Bad Request",
        message: "You are not a member of this group.",
      });
    }
    //is user group owner?
    if (!String(group.groupOwner) === userId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Only the group owner can edit this group.",
      });
    }
    //has group expired?
    if (group.date && group.date < new Date()) {
      return res.status(400).json({
        error: "Bad Request",
        message: "You can't edit an expired group.",
      });
    }

    group.groupName = req.body.groupName;
    group.city = req.body.city;
    group.onOffline = req.body.onOffline;
    group.tags = req.body.tags;
    group.pic = req.body.pic;
    group.location = req.body.location;
    group.maxMembers = req.body.maxMembers || 0;
    group.date = req.body.date;
    group.description = req.body.description;

    await group.save();

    return res.status(200).json(group);
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

const deleteGroup = async (req, res) => {
  //initialization
  const id = req.params.groupId;
  const userId = req.userId;

  try {
    //get group and user
    const group = await GroupModel.findById(id)
      .populate("groupMembers", "username premium.active")
      .populate("groupOwner", "username");

    //is user in group?
    if (!group.groupMembers.some((member) => member._id.equals(userId))) {
      return res.status(400).json({
        error: "Bad Request",
        message: "You are not a member of this group.",
      });
    }
    //is user group owner?
    if (!String(group.groupOwner) === userId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Only the group owner can edit this group.",
      });
    }

    group.deleted = true;

    await group.save();

    return res.status(200).json("Deleted group!");
  } catch (err) {
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
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

function sortGroups(groups) {
  const groupsWithTimestamp = groups.map((group) => {
    return {
      ...group,
      timestamp: mongoose.Types.ObjectId(group._id).getTimestamp(),
    };
  });
  groupsWithTimestamp.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  return groupsWithTimestamp;
}

module.exports = {
  create,
  getAll,
  getGroup,
  mine,
  recommended,
  inMyArea,
  joinGroup,
  leaveGroup,
  editGroup,
  deleteGroup,
  getProcessedGroupChat,
};
