const express = require("express");
const router = express.Router();

// const { requireSignin, isAuth } = require("../controllers/auth");
const { hasAuthorization, adminMiddleware } = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

const { userById } = require("../controllers/user");
const { generateToken, processPayment } = require("../controllers/braintree");

router.get(
  "/braintree/getToken/:userId",
  requireSignin,
  hasAuthorization,
  generateToken
);
router.post(
  "/braintree/payment/:userId",
  requireSignin,
  hasAuthorization,
  processPayment
);

router.param("userId", userById);

module.exports = router;
