const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Port that the webserver listens to
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`API is running on port ${port}`);
});

//socket
const io = require("socket.io").listen(server);

// const socketsConected = new Set();

// io.on("connection", onConnected);

// function onConnected(socket) {
//   // console.log("Socket connected", socket.id);
//   socketsConected.add(socket.id);
//   console.log(socketsConected.size);
//   console.log(socketsConected);
//   io.emit("clients-total", socketsConected.size);

//   socket.on("disconnect", () => {
//     console.log("Socket disconnected", socket.id);
//     socketsConected.delete(socket.id);
//     console.log(socketsConected.size);
//     console.log(socketsConected);
//     io.emit("clients-total", socketsConected.size);
//   });

//   // socket.on("message", (data) => {
//   //   // console.log(data)
//   //   socket.broadcast.emit("chat-message", data);
//   // });

//   // socket.on("feedback", (data) => {
//   //   socket.broadcast.emit("feedback", data);
//   // });
// }

// connect to db
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB CONNECTION ERROR: ", err));

// import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const braintreeRoutes = require("./routes/braintree");
const orderRoutes = require("./routes/order");

// app middleware -
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

// app.use(cors()); // allows all origins
app.use(cors({ origin: process.env.CLIENT_URL }));

// Assign socket object to every request
app.use(function (req, res, next) {
  req.io = io;
  next();
});

// middleware
app.use("/api", postRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", braintreeRoutes);
app.use("/api", orderRoutes);
