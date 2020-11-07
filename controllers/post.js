const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");
const { getFileType, s3, uploadParams, deleteParams } = require("./amazonS3");
require("dotenv").config();

exports.postById = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "_id name role")
    .populate("comments.postedBy", "_id name role")
    .populate("postedBy", "_id name role")
    .select("_id title body created likes comments photo")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(400).json({
          error: err,
        });
      }
      req.post = post;
      next();
    });
};

// with pagination
exports.getPosts = async (req, res) => {
  // get current page from req.query or use default value of 1
  const currentPage = req.query.page || 1;
  // return 3 posts per page
  const perPage = 6;
  let totalItems;

  const posts = await Post.find()
    // countDocuments() gives you total count of posts
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .populate("comments", "text created")
        .populate("comments.postedBy", "_id name role")
        .populate("postedBy", "_id name role")
        .select("_id title body created likes")
        .limit(perPage)
        .sort({ created: -1 });
    })
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => console.log(err));
};

exports.createPost = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    let post = new Post(fields);

    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    post.postedBy = req.profile;

    let { photo } = files;

    if (photo) {
      //upload image to s3
      s3.upload(uploadParams("posts", photo), (error, data) => {
        if (error) {
          console.log(error);
          res.status(400).json({ error: "File upload failed" });
        }
        if (data === undefined) {
          console.log("Error: No File Selected!");
          res.json({ error: "No File Selected" });
        }
        console.log("AWS UPLOAD RES DATA");
        post.photo.url = data.Location;
        post.photo.key = data.Key;
        post.photo.name = photo.name;
        post.photo.contentType = photo.type;
      });
    }

    post.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(result);
    });
  });
};

exports.postsByUser = (req, res) => {
  Post.find({ postedBy: req.profile._id })
    .populate("postedBy", "_id name role")
    .select("_id title body created likes comments photo")
    .sort("_created")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(posts);
    });
};

exports.isPoster = (req, res, next) => {
  let sameUser = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  let adminUser = req.post && req.auth && req.auth.role === "admin";

  // console.log("req.post ", req.post, " req.auth ", req.auth);
  // console.log("SAMEUSER: ", sameUser, " ADMINUSER: ", adminUser);

  let isPoster = sameUser || adminUser;

  if (!isPoster) {
    return res.status(403).json({
      error: "User is not authorized",
    });
  }
  next();
};

exports.updatePost = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded",
      });
    }
    // save post
    let post = req.post;
    post = _.extend(post, fields);
    post.updated = Date.now();

    let { photo } = files;

    if (photo) {
      //delete product photo url
      s3.deleteObject(deleteParams(post), function (err, data) {
        // if (err) {console.log("S3 DELETE ERROR DUING", err);
        if (err) {
          console.log("S3 DELETE ERROR DUING", err);
          return res.status(400).json({
            error: "Post Delete failed",
          });
        }
        console.log("S3 DELETED DURING", data);
      });

      //upload image to s3
      s3.upload(uploadParams("posts", photo), (error, data) => {
        if (error) {
          console.log(error);
          res.status(400).json({ error: "File upload failed" });
        }
        if (data === undefined) {
          console.log("Error: No File Selected!");
          res.json({ error: "No File Selected" });
        }
        console.log("AWS UPLOAD RES DATA");
        post.photo.url = data.Location;
        post.photo.key = data.Key;
        post.photo.name = photo.name;
        post.photo.contentType = photo.type;
      });

      //save to db
      post.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }
        res.json(result);
      });
    } else {
      //save to db
      post.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }
        res.json(result);
      });
    }
  });
};

exports.deletePost = (req, res) => {
  let post = req.post;
  post.remove((err, thepost) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    // remove the existing image from s3 before uploading new/updated one
    s3.deleteObject(deleteParams(thepost), function (err, data) {
      if (err) {
        console.log("S3 DELETE ERROR DUING", err);
        return res.status(400).json({
          error: "Post Delete failed",
        });
      }
      console.log("S3 DELETED DURING", data); // deleted
    });

    res.status(200).json({
      message: "Post deleted successfully",
    });
  });
};

exports.photo = (req, res, next) => {
  res.set("Content-Type", req.post.photo.contentType);
  return res.send(req.post.photo.data);
};

exports.singlePost = (req, res) => {
  return res.json(req.post);
};

exports.like = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    } else {
      res.json(result);
    }
  });
};

exports.unlike = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    } else {
      res.json(result);
    }
  });
};

exports.comment = (req, res) => {
  let comment = req.body.comment;
  comment.postedBy = req.body.userId;

  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { comments: comment } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name role")
    .populate("postedBy", "_id name role")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      } else {
        res.json(result);
      }
    });
};

exports.uncomment = (req, res) => {
  let comment = req.body.comment;

  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { comments: { _id: comment._id } } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name role")
    .populate("postedBy", "_id name role")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      } else {
        res.json(result);
      }
    });
};

exports.updateComment = (req, res) => {
  let comment = req.body.comment;

  Post.findByIdAndUpdate(req.body.postId, {
    $pull: { comments: { _id: comment._id } },
  }).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    } else {
      Post.findByIdAndUpdate(
        req.body.postId,
        { $push: { comments: comment, updated: new Date() } },
        { new: true }
      )
        .populate("comments.postedBy", "_id name role")
        .populate("postedBy", "_id name role")
        .exec((err, result) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          } else {
            res.json(result);
          }
        });
    }
  });
};
