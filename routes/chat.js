const app = require("../app");
const routes = require("express").Router();
const User = require("../models/User");
const Chat = require("../models/Chat");
// Add Socket.IO package
const http = require("http").Server(app);
const io = require("socket.io")(http);

var ObjectId = require("mongoose").Types.ObjectId;

routes.get("/all/:from/:to", (req, res) => {
  const from = req.params.from;
  const to = req.params.to;

  Chat.findOne(
    {
      $or: [
        { senderId: from, receiverId: to },
        { senderId: to, receiverId: from }
      ]
    },
    (err, chats) => {
      console.log(chats);
      if (chats && chats.messages) {
        return res.status(200).json({
          message: "Successfully retrieved the chats",
          data: chats
        });
      } else {
        return res.status(404).json({
          message: "No chats found"
        });
      }
    }
  );
});

routes.post("/send/:from/:to", (req, res) => {
  var message = req.body.message;
  var senderName = req.body.senderName;
  var from = req.params.from;
  var to = req.params.to;
  console.log(message, senderName, from, to);
  Chat.updateOne(
    {
      $or: [
        { senderId: from, receiverId: to },
        { senderId: to, receiverId: from }
      ]
    },
    {
      senderId: from,
      receiverId: to,
      $push: {
        messages: {
          message,
          senderName
        }
      }
    },
    { new: true, upsert: true }, // set upsert to true to push a new message in the existing array of messages
    (err, result) => {
      if (err) console.log(err);
      if (result.n >= 1 || nModified > 0) {
        //a new Message is added successfully
        io.emit("getChat", result);
        return res.status(200).json({
          message: "Successfully added new message"
        });
      }
    }
  );
});

module.exports = routes;
