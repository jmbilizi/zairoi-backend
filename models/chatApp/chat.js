const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

var ChatSchema = new mongoose.Schema({
  sender: {
    type: ObjectId,
    ref: "User",
  },
  messages: [
    {
      message: String,
      time: {
        type: Date,
        default: Date.now,
      },
      isRight: true,
      meta: [
        {
          receiver: {
            type: ObjectId,
            ref: "User",
          },
          delivered: Boolean,
          read: Boolean,
        },
      ],
    },
  ],
  is_group_message: { type: Boolean, default: false },
  participants: [
    {
      user: {
        type: ObjectId,
        ref: "User",
      },
      delivered: Boolean,
      read: Boolean,
      last_seen: Date,
    },
  ],
  chats: [
    {
      user: {
        type: ObjectId,
        ref: "User",
      },
      name: string,
      status: string,
      image: {
        data: Buffer,
        contentType: String,
      },
      description: string,
      time: string,
      isActive: Boolean,
    },
  ],
});

module.exports = mongoose.model("Chat", ChatSchema);
