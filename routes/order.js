const express = require("express");
const router = express.Router();

// const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { hasAuthorization, adminMiddleware } = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

const { userById, addOrderToUserHistory } = require("../controllers/user");
const {
  create,
  listOrders,
  getStatusValues,
  orderById,
  updateOrderStatus,
} = require("../controllers/order");
const { decreaseQuantity } = require("../controllers/product");

router.post(
  "/order/create/:userId",
  requireSignin,
  hasAuthorization,
  addOrderToUserHistory,
  decreaseQuantity,
  create
);

router.get("/order/list/:userId", requireSignin, hasAuthorization, listOrders);
router.get(
  "/order/status-values/:userId",
  requireSignin,
  hasAuthorization,
  getStatusValues
);
router.put(
  "/order/:orderId/status/:userId",
  requireSignin,
  hasAuthorization,
  updateOrderStatus
);

router.param("userId", userById);
router.param("orderId", orderById);

module.exports = router;
