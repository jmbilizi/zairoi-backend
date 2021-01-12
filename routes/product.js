const express = require("express");
const router = express.Router();

const {
  create,
  productById,
  read,
  remove,
  update,
  productsByUser,
  isSeller,
  list,
  listRelated,
  listCategories,
  listBySearch,
  photo,
  listSearch,
} = require("../controllers/product");

// const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { hasAuthorization, adminMiddleware } = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

const { userById } = require("../controllers/user");

router.get("/product/:productId", read);
router.post("/product/create/:userId", requireSignin, create);
router.get("/products/by/:userId", requireSignin, productsByUser);
router.delete("/product/:productId/:userId", requireSignin, isSeller, remove);
router.put("/product/:productId/:userId", requireSignin, isSeller, update);

router.get("/products", list);
router.get("/products/search", listSearch);
router.get("/products/related/:productId", listRelated);
router.get("/products/categories", listCategories);
router.post("/products/by/search", listBySearch);
router.get("/product/photo/:productId", photo);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
