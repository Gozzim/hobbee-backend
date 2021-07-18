const ChatMessageModel = require("../models/chatMessage");
const GroupModel = require("../models/group");
const UserModel = require("../models/user");

let io;

async function processChatData(chat) {
  try {
    return await Promise.all(chat.map(async (messageId) => {
      const chatMessage = await ChatMessageModel.findById(messageId).exec();
      const styledTimestamp = new Date(chatMessage.timestamp).toLocaleString(
        "en-GB",
        {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
      //user message
      if (!chatMessage.isSystemMessage) {
        const user = await UserModel.findById(chatMessage.sender).exec();
        const name = user.username;
        return {
          isSystemMessage: chatMessage.isSystemMessage,
          message: chatMessage.message,
          sender: chatMessage.sender,
          timestamp: styledTimestamp,
          _id: chatMessage.id,
          senderName: name,
        };
        //system message
      } else {
        return {
          isSystemMessage: chatMessage.isSystemMessage,
          message: chatMessage.message,
          timestamp: styledTimestamp,
          _id: chatMessage.id,
        };
      }
    }));
  } catch (e) {
    console.log(e);
  }
}

// Emitters
const emitSystemMessage = async (data) => {
  const newChat = await processChatData(data);
  io.emit("return message", newChat);
  io.broadcast.emit("return message", newChat);
};

const socketConnection = async (server) => {
  io = require("socket.io")(server, {
    cors: {
      //TODO: refactor origin adress
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    //join room
    socket.on("room", room => {
      socket.join(room);
    });

    // user message listener
    socket.on("new user message", async (data) => {
      const message = {
        sender: data.sender,
        message: data.message,
        timestamp: data.timestamp,
        isSystemMessage: data.isSystemMessage,
      };

      //db write operation
      const newMessage = await ChatMessageModel.create(message);

      const group = await GroupModel.findById(data.groupId).exec();
      const updatedChat = group.chat;
      updatedChat.push(newMessage._id);
      try {
        await GroupModel.updateOne(
          { _id: data.groupId },
          {
            chat: updatedChat,
          }
        );
        //if successful
        const returnChat = await processChatData(updatedChat);

        socket.emit("return message", returnChat);
        socket.to(data.groupId).emit("return message", returnChat);
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("disconnect", () => {
      console.info(`Client disconnected [id=${socket.id}]`);
    });
  });
};

module.exports = { processChatData, emitSystemMessage, socketConnection }
