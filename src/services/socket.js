const ChatMessageModel = require("../models/chatMessage");
const GroupModel = require("../models/group");
const UserModel = require("../models/user");
const NotificationModel = require("../models/notification");
const config = require("../config");

let io;

async function processChatData(chat) {
  try {
    return await Promise.all(
      chat.map(async (messageId) => {
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
            _id: chatMessage._id,
            senderName: name,
          };
          //system message
        } else {
          return {
            isSystemMessage: chatMessage.isSystemMessage,
            message: chatMessage.message,
            timestamp: styledTimestamp,
            _id: chatMessage._id,
          };
        }
      })
    );
  } catch (e) {
    console.log(e);
  }
}

/*
 * TODO:
 *  - try catch for sockets?
 *  - io = require warning?
 *  - all queries must be inside try catch
 *  - Date.now() vs Date from client
 *  - restrictions: pingTimeout, connectTimeout, maxHttpBufferSize, no spam
 */
const socketConnection = async (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: config.frontendDomain,
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    //join room
    socket.on("room", (room, userId) => {
      socket.join(room);
      socket.username = userId;
    });

    // user message listener
    socket.on("new user message", async (data) => {
      const message = {
        sender: data.sender,
        message: data.message,
        timestamp: data.timestamp,
        isSystemMessage: data.isSystemMessage,
      };

      // Error handling
      if (!data.message || !data.message.replace(/\s/g, "").length) {
        return;
      }

      //db write operation
      const newMessage = await ChatMessageModel.create(message);

      const group = await GroupModel.findById(data.groupId);
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

        // Iterate over group members and find members not currently in chat
        const clients = Array.from(io.sockets.adapter.rooms.get(data.groupId));
        group.groupMembers.map(async (member) => {
          clients.map(async (client) => {
            if (!member.equals(io.sockets.sockets.get(client).username)) {
              // Update or create notification for this chat
              await NotificationModel.updateOne(
                {
                  user: member,
                  group: group._id,
                  notificationType: "Chat",
                },
                {
                  content: "New chat message: " + data.message,
                  link: `/group/${data.groupId}`,
                  date: data.timestamp,
                },
                { upsert: true }
              );
            }
          });
        });
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("system update message", async (data) => {
      const group = await GroupModel.findById(data.groupId).exec();
      const returnChat = await processChatData(group.chat);
      socket.emit("return message", returnChat);
      socket.to(data.groupId).emit("return message", returnChat);
    });

    socket.on("disconnect", () => {
      console.info(`Client disconnected [id=${socket.id}]`);
    });
  });
};

module.exports = { processChatData, socketConnection };
