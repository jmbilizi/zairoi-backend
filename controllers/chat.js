const Message = require("../models/message");
const mongoose = require("mongoose");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const formidable = require("formidable");
const Conversation = require("../models/chat");

// Get conversations list
router.get("/chat", (req, res) => {
  let from = req.profile;
  Conversation.aggregate([
    {
      $lookup: {
        from: "User",
        localField: "recipients",
        foreignField: "_id",
        as: "recipientObj",
      },
    },
  ])
    .match({ recipients: { $all: [{ $elemMatch: { $eq: from } }] } })
    .project({
      "recipientObj.password": 0,
      "recipientObj.__v": 0,
      "recipientObj.date": 0,
    })
    .exec((err, chat) => {
      if (err) {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Failure" }));
        res.sendStatus(500);
      } else {
        res.send(chat);
      }
    });
});

// Get messages from conversation
// based on to & from
router.get("/chat/query", (req, res) => {
  let user1 = req.profile;
  let user2 = mongoose.Types.ObjectId(req.query.userId);
  Message.aggregate([
    {
      $lookup: {
        from: "User",
        localField: "to",
        foreignField: "_id",
        as: "toObj",
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "from",
        foreignField: "_id",
        as: "fromObj",
      },
    },
  ])
    .match({
      $or: [
        { $and: [{ to: user1 }, { from: user2 }] },
        { $and: [{ to: user2 }, { from: user1 }] },
      ],
    })
    .project({
      "toObj.password": 0,
      "toObj.__v": 0,
      "toObj.date": 0,
      "fromObj.password": 0,
      "fromObj.__v": 0,
      "fromObj.date": 0,
    })
    .exec((err, messages) => {
      if (err) {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Failure" }));
        res.sendStatus(500);
      } else {
        res.send(messages);
      }
    });
});
