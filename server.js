const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

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

// apiDocs
app.get("/api", (req, res) => {
  fs.readFile("docs/apiDocs.json", (err, data) => {
    if (err) {
      res.status(400).json({
        error: err,
      });
    }
    const docs = JSON.parse(data);
    res.json(docs);
  });
});

// app middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());

// app.use(cors()); // allows all origins
app.use(cors({ origin: process.env.CLIENT_URL }));

// middleware
app.use(authRoutes);
app.use(userRoutes);

// middleware -
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use("/api", postRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized!" });
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`API is running on port ${port}`);
});
