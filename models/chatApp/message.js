const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
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
  data: [
    {
      type: String,
      content: Mixed,
    },
  ],
  time: {
    type: Date,
    default: Date.now,
  },
  delivered: { type: Boolean, default: false },
  is_group_message: { type: Boolean, default: false },
  likes: [{ type: ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Message", MessageSchema);
