const mongoose = require("mongoose");
const uuidv1 = require("uuid/v1");
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;
const Post = require("./post");
// user schema
const userScheama = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String,
    created: {
      type: Date,
      default: Date.now,
    },
    updated: Date,
    photo: {
      data: Buffer,
      contentType: String,
    },
    about: {
      type: String,
      trim: true,
    },
    following: [{ type: ObjectId, ref: "User" }],
    followers: [{ type: ObjectId, ref: "User" }],
    resetPasswordLink: {
      data: String,
      default: "",
    },
    role: {
      type: String,
      default: "subscriber",
    },
  },
  { timestamps: true }
);

// virtual
userScheama
  .virtual("password")
  .set(function (password) {
    this._password = password;
    // generate a timestamp
    this.salt = uuidv1();
    // this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// methods
userScheama.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password; // true false
  },

  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },

  //   makeSalt: function () {
  //     return Math.round(new Date().valueOf() * Math.random()) + "";
  //   },
};

// pre middleware
userScheama.pre("remove", function (next) {
  Post.remove({ postedBy: this._id }).exec();
  next();
});

module.exports = mongoose.model("User", userScheama);
