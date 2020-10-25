const Message = require("../models/chatApp/message");
const mongoose = require("mongoose");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const formidable = require("formidable");

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

// exports.CreateAndFindMessages = (req, res, next) => {
//   io.on("connection", (socket) => {
//     // Get the last 10 messages from the database.
//     Message.find({
//       is_group_message: false && (sender || receivers[0] === req.profile._id),
//     })
//       .sort({ createdAt: -1 })
//       // .limit(10)
//       .exec((err, messages) => {
//         if (err) return console.error(err);

//         // Send the last messages to the user.
//         socket.emit("init", messages);
//       });

//     // Listen to connected users for a new message.
//     socket.on("message", (msg) => {
//       let form = new formidable.IncomingForm();
//       form.keepExtensions = true;
//       form.parse(req, (err, fields, files) => {
//         if (err) {
//           return res.status(400).json({
//             error: "Image could not be uploaded",
//           });
//         }
//         // Create a message with the content and the name of the user.
//         const message = new Message(fields);

//         req.profile.hashed_password = undefined;
//         req.profile.salt = undefined;
//         message.sender = req.profile;

//         if (files.photo) {
//           message.content.data = fs.readFileSync(files.photo.path);
//         }
//         // Save the message to the database.
//         message.save((err) => {
//           if (err) return console.error(err);
//         });
//         // Notify all other users about a new message.
//         socket.broadcast.emit("push", msg);
//       });
//     });
//   });
// };
