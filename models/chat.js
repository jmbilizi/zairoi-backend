const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

var ChatSchema = new mongoose.Schema({
  recipients: [
    {
      user: {
        type: ObjectId,
        ref: "User",
      },
      delivered: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      last_seen: Date,
    },
  ],
  lastMessage: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  isActive: { type: Boolean, default: false },
  status: String,
});

module.exports = mongoose.model("Chat", ChatSchema);
