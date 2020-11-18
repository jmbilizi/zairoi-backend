const express = require("express");
const router = express.Router();
const {
  createMessage,
  getMessages,
  deleteMessage,
  messageById,
} = require("../controllers/message");

const { chat, chatQuery } = require("../controllers/chat");

const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

// post routes
router.post("/message/new/:userId", requireSignin, createMessage);
// post routes
router.get("/messages", requireSignin, getMessages);

// post routes
router.delete("/message/:messageId", requireSignin, deleteMessage);

//get chat
router.get("/chat", requireSignin, chat);

//chat query
router.get("/chat/query", requireSignin, chatQuery);

// any route containing :userId, our app will first execute userById()
router.param("userId", userById);

// any route containing :postId, our app will first execute postById()
router.param("messageId", messageById);

module.exports = router;
