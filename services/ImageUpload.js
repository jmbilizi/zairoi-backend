const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

const s3 = new aws.S3();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "us-east-1",
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: "public-read",
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

module.exports = upload;


// const upload = require("../services/ImageUpload");
// const singleUpload = upload.single("image");

// router.post("/:id/add-profile-picture", function (req, res) {
//   const uid = req.params.id;

//   singleUpload(req, res, function (err) {
//     if (err) {
//       return res.json({
//         success: false,
//         errors: {
//           title: "Image Upload Error",
//           detail: err.message,
//           error: err,
//         },
//       });
//     }

//     let update = { profilePicture: req.file.location };

//     User.findByIdAndUpdate(uid, update, { new: true })
//       .then((user) => res.status(200).json({ success: true, user: user }))
//       .catch((err) => res.status(400).json({ success: false, error: err }));
//   });
// });