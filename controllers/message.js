const Message = require("../models/chatApp/message");
const mongoose = require("mongoose");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const formidable = require("formidable");

exports.CreateAndFindMessages = (req, res, next) => {
  io.on("connection", (socket) => {
    // Get the last 10 messages from the database.
    Message.find({
      is_group_message: false && (sender || receivers[0] === req.profile._id),
    })
      .sort({ createdAt: -1 })
      // .limit(10)
      .exec((err, messages) => {
        if (err) return console.error(err);

        // Send the last messages to the user.
        socket.emit("init", messages);
      });

    // Listen to connected users for a new message.
    socket.on("message", (msg) => {
      let form = new formidable.IncomingForm();
      form.keepExtensions = true;
      form.parse(req, (err, fields, files) => {
        if (err) {
          return res.status(400).json({
            error: "Image could not be uploaded",
          });
        }
        // Create a message with the content and the name of the user.
        const message = new Message(fields);

        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;
        message.sender = req.profile;

        if (files.photo) {
          message.content.data = fs.readFileSync(files.photo.path);
        }
        // Save the message to the database.
        message.save((err) => {
          if (err) return console.error(err);
        });
        // Notify all other users about a new message.
        socket.broadcast.emit("push", msg);
      });
    });
  });
};
