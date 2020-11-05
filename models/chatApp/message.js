const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
  chat: {
    type: ObjectId,
    ref: "Chat",
  },
  sender: {
    type: ObjectId,
    ref: "User",
  },
  receivers: [
    {
      receiver: {
        type: ObjectId,
        ref: "User",
      },
      read: { type: Boolean, default: false },
    },
  ],
  body: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  delivered: { type: Boolean, default: false },
  is_group_message: { type: Boolean, default: false },
  likes: [{ type: ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Message", MessageSchema);
