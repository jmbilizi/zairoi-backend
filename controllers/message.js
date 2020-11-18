const Message = require("../models/message");
const Conversation = require("../models/chat");
const mongoose = require("mongoose");
const formidable = require("formidable");

//post by id
exports.messageById = (req, res, next, id) => {
  Message.findById(id)
    .populate("sender", "_id name role photo")
    .populate("receivers.receiver", "_id name role photo")
    .select(
      "_id chat sender receivers body time delivered is_group_message likes"
    )
    .exec((err, message) => {
      if (err || !message) {
        return res.status(400).json({
          error: err,
        });
      }
      req.message = message;
      next();
    });
};

// with pagination
exports.getMessages = async (req, res) => {
  Message.find().exec((err, data) => {
    if (err) {
      console.log(err);
      return res.status(400);
    }
    res.status(200).json(data);
  });
};

exports.createMessage = (req, res, next) => {
  let from = req.profile;
  let to = mongoose.Types.ObjectId(req.body.receivers);

  Conversation.findOneAndUpdate(
    {
      recipients: {
        $all: [{ $elemMatch: { $eq: from } }, { $elemMatch: { $eq: to } }],
      },
    },
    {
      recipients: [req.profile, req.body.receivers],
      lastMessage: req.body.body,
      time: Date.now(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
    function (err, conversation) {
      if (err) {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Failure" }));
        res.sendStatus(500);
      } else {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, (err, fields, files) => {
          if (err) {
            return res.status(400).json({
              error: "file could not be uploaded",
            });
          }
          const message = new Message(fields);
          let data = message.data;

          req.profile.hashed_password = undefined;
          req.profile.salt = undefined;
          message.sender = req.profile;

          //emit with io
          req.io.sockets.emit("messages", req.body.body);

          if (files.file) {
            for (let i = 0; i < data.length; i++) {
              data[i].type = fs.readFileSync(files.file.path);
              data[i].content = files.file.type;
            }
          }

          message.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: err,
              });
            }
            res.json(result);
          });
        });
      }
    }
  );
};

exports.deleteMessage = (req, res) => {
  let message = req.message;
  message.remove((err, message) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json({
      message: "Message deleted successfully",
    });
  });
};

exports.file = (req, res, next) => {
  for (let i = 0; i < req.message.data.length; i++) {
    res.set("Content-Type", req.message.data[i].content);
    return res.send(req.message.data[i].type);
  }
};
