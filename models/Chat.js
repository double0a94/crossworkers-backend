/**
 * "messages" array of objects should be in a seperate collection,
 * to allow faster collection read and writes if we have large number of chats
 * between two employee
 * but for this task it should be ok
 */
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    senderId: String,
    receiverId: String,
    messages: [
      {
        sentAt: { type: Date, default: Date.now },
        message: { type: String },
        senderName: { type: String }
      }
    ]
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
